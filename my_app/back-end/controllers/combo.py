from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_course_prerequisites(course_code: str) -> list:
    """
    Возвращает список кодов курсов, которые являются prerequisites для данного course_code.
    Работает с таблицей prerequisites и полем prerequisite_schema (json).
    """
    resp = supabase.table("prerequisites") \
        .select("prerequisite_schema") \
        .eq("course_code", course_code) \
        .execute()
    if not resp.data:
        return []
    schema = resp.data[0]["prerequisite_schema"]
    if not schema:
        return []
    if isinstance(schema, str):
        schema = json.loads(schema)
    return extract_courses_from_schema(schema)

def extract_courses_from_schema(schema) -> list:
    """
    Рекурсивно извлекает коды курсов из prerequisite_schema (может быть AND/OR/одиночный)
    """
    courses = []
    if isinstance(schema, dict):
        if "course" in schema:
            course = schema["course"].split(" Minimum Grade")[0].strip()
            courses.append(course)
        elif "requirements" in schema:
            for req in schema["requirements"]:
                courses.extend(extract_courses_from_schema(req))
    elif isinstance(schema, list):
        for item in schema:
            courses.extend(extract_courses_from_schema(item))
    return courses


def get_course_prerequisites(course_code: str) -> list:
    """
    Возвращает список кодов курсов, которые являются prerequisites для данного course_code.
    Работает с таблицей prerequisites и полем prerequisite_schema (json).
    """
    resp = supabase.table("prerequisites") \
        .select("prerequisite_schema") \
        .eq("course_code", course_code) \
        .execute()
    if not resp.data:
        return []
    schema = resp.data[0]["prerequisite_schema"]
    if not schema:
        return []
    if isinstance(schema, str):
        schema = json.loads(schema)
    return extract_courses_from_schema(schema)

def extract_courses_from_schema(schema) -> list:
    """
    Рекурсивно извлекает коды курсов из prerequisite_schema (может быть AND/OR/одиночный)
    """
    courses = []
    if isinstance(schema, dict):
        if "course" in schema:
            course = schema["course"].split(" Minimum Grade")[0].strip()
            courses.append(course)
        elif "requirements" in schema:
            for req in schema["requirements"]:
                courses.extend(extract_courses_from_schema(req))
    elif isinstance(schema, list):
        for item in schema:
            courses.extend(extract_courses_from_schema(item))
    return courses

def get_merged_requirements_for_student(
    student_id: int,
    major_program_name: str,
    core_program_name: str = "University Core Requirements",
    full_view: bool = False,
    debug: bool = False
) -> dict:
    """
    Универсальная функция, объединяющая логику "Core" и "Major" в одном месте.
    В выводе:
      - Для Core-групп (название содержит "core") поле available_courses будет строкой вида "CORE X".
      - Для не-Core групп available_courses будет списком доступных курсов.

    :param student_id:        ID студента (user_id в таблице enrollments)
    :param major_program_name: Название Major-программы (например, "B.S. Computer Science - Data Science Concentration")
    :param core_program_name:  Название Core-программы (по умолчанию "University Core Requirements")
    :param full_view:          Если True, выводит детальную информацию
    :param debug:              Если True, печатает отладочные сообщения
    :return: словарь вида:
        {
          "core_requirements": { ...результат для Core... },
          "major_requirements": { ...результат для Major... }
        }
    """

    resp_enroll = supabase.table("enrollments") \
        .select("section_id") \
        .eq("user_id", student_id) \
        .execute()
    if not resp_enroll.data:
        if debug:
            print(f"[DEBUG] Student {student_id} has no enrollments.")
        return {
            "core_requirements": {},
            "major_requirements": {}
        }

    enrolled_section_ids = [row["section_id"] for row in resp_enroll.data]

    resp_secs = supabase.table("sections") \
        .select("course_id, term, section, attribute") \
        .in_("section_id", enrolled_section_ids) \
        .execute()
    student_sections = resp_secs.data or []

    taken_classes_core = []
    taken_courses_major = set()

    for sec in student_sections:
        c_id = sec["course_id"]
        t = sec["term"]
        s = sec["section"]

        taken_classes_core.append({
            "course_id": c_id,
            "term": t,
            "section": s
        })
        taken_courses_major.add(c_id)

    taken_courses_major = set(taken_courses_major)

    core_requirements = {}
    resp_core_prog = supabase.table("programs").select("program_id") \
        .eq("degree_program", core_program_name).execute()
    if not resp_core_prog.data:
        if debug:
            print(f"[DEBUG] Core program '{core_program_name}' not found.")
    else:
        core_program_id = resp_core_prog.data[0]["program_id"]
        resp_core_groups = supabase.table("requirement_groups") \
            .select("*") \
            .eq("program_id", core_program_id) \
            .execute()
        core_groups = resp_core_groups.data or []

        for g in core_groups:
            g["json_id"] = g.get("json_group_id", 0)
        core_groups.sort(key=lambda x: int(x["json_id"] or 0))

        course_ids_for_core = {sec["course_id"] for sec in student_sections}
        resp_cr = supabase.table("courses").select("code, credits") \
            .in_("code", list(course_ids_for_core)) \
            .execute()
        course_map_core = {row["code"]: row["credits"] for row in (resp_cr.data or [])}

        taken_info_core = {}
        for sec in student_sections:
            c_id = sec["course_id"]
            t = sec["term"]
            s = sec["section"]
            attr_str = sec.get("attribute", "") or ""
            core_attrs = []
            for part in attr_str.split(","):
                part = part.strip()
                if part.lower().startswith("core:"):
                    extracted = part[5:].strip()
                    core_attrs.append(extracted)

            c_credits = course_map_core.get(c_id, 0)
            taken_info_core[(c_id, t, s)] = {
                "core_attrs": core_attrs,
                "credits": c_credits
            }

        for group in core_groups:
            group_name = group["name"]
            group_json_id = int(group.get("json_id", 0))
            required_credits = group.get("req_credits", 0)
            group_id = group["id"]

            is_core_group = ("core" in group_name.lower())
            allocated_courses = []
            total_taken_credits = 0

            if is_core_group:
                lower_name = group_name.lower()
                if lower_name.startswith("core "):
                    expected_attribute = group_name[5:].strip()
                elif lower_name.endswith(" core"):
                    expected_attribute = group_name[:-4].strip()
                else:
                    parts = group_name.split()
                    filtered_parts = [p for p in parts if p.lower() != "core"]
                    expected_attribute = " ".join(filtered_parts).strip()

                for key, info in taken_info_core.items():
                    if expected_attribute and (expected_attribute in info["core_attrs"]):
                        allocated_courses.append(key[0])
                        total_taken_credits += info["credits"]

                available_courses_val = f"CORE {required_credits}"
            else:
                expected_attribute = None
                resp_req = supabase.table("requirement_courses") \
                    .select("course_code") \
                    .eq("group_id", group_id) \
                    .execute()
                potential_codes = set()
                for row in (resp_req.data or []):
                    potential_codes.add(row["course_code"])

                for (c_id, t, s), info in taken_info_core.items():
                    if c_id in potential_codes:
                        allocated_courses.append(c_id)
                        total_taken_credits += info["credits"]

                potential_list = sorted(potential_codes)
                available_courses_val = potential_list

            remaining_credits = max(0, required_credits - total_taken_credits)
            core_requirements[group_name] = {
                "json_id": group_json_id,
                "required_credits": required_credits,
                "taken_credits": total_taken_credits,
                "remaining_credits": remaining_credits,
                "taken_courses_in_group": sorted(set(allocated_courses)),
                "available_courses": available_courses_val,
                "expected_attribute": (expected_attribute if is_core_group else None)
            }

            if debug:
                print(f"[DEBUG:CORE] {group_name} => allocated={allocated_courses}, total_credits={total_taken_credits}")

    major_requirements = {}
    resp_major_prog = supabase.table("programs").select("program_id") \
        .eq("degree_program", major_program_name).execute()
    if not resp_major_prog.data:
        if debug:
            print(f"[DEBUG] Major program '{major_program_name}' not found.")
    else:
        major_program_id = resp_major_prog.data[0]["program_id"]
        resp_major_groups = supabase.table("requirement_groups") \
            .select("*") \
            .eq("program_id", major_program_id) \
            .execute()
        major_groups = resp_major_groups.data or []

        for mg in major_groups:
            mg["json_id"] = mg.get("json_group_id", 0)
            note = mg.get("note", "") or ""
            mg["double_count_groups"] = []
            if "Can double count with" in note:
                try:
                    parts = note.split("with")[-1].replace("(", "").replace(")", "").split(",")
                    mg["double_count_groups"] = [int(x.strip()) for x in parts if x.strip().isdigit()]
                except ValueError:
                    mg["double_count_groups"] = []

        major_groups.sort(key=lambda x: int(x["json_id"] or 0))

        resp_cr_maj = supabase.table("courses").select("code, credits") \
            .in_("code", taken_courses_major).execute()
        course_map_major = {row["code"]: row["credits"] for row in (resp_cr_maj.data or [])}

        processed_groups = []
        for group in major_groups:
            group_name = group["name"]
            group_json_id = int(group["json_id"] or 0)
            required_credits = group.get("req_credits", 0)
            group_id = group["id"]
            allowed_for_double = set(group["double_count_groups"])

            resp_req = supabase.table("requirement_courses") \
                .select("course_code") \
                .eq("group_id", group_id).execute()
            potential_courses = set(r["course_code"] for r in (resp_req.data or []))

            allowed_set = set()
            exclusion_set = set()
            for (prev_json_id, allocated_set) in processed_groups:
                if prev_json_id in allowed_for_double:
                    allowed_set |= allocated_set
                else:
                    exclusion_set |= allocated_set

            available_courses = (potential_courses - exclusion_set) | (allowed_set & potential_courses)
            allocated_current = set()
            for c_id in available_courses:
                if c_id in taken_courses_major:
                    allocated_current.add(c_id)

            taken_credits = sum(course_map_major.get(c, 0) for c in allocated_current)
            remaining_credits = max(0, required_credits - taken_credits)

            processed_groups.append((group_json_id, allocated_current))

            display_available = sorted(available_courses - allocated_current)
            major_requirements[group_name] = {
                "json_id": group_json_id,
                "required_credits": required_credits,
                "taken_credits": taken_credits,
                "remaining_credits": remaining_credits,
                "taken_courses_in_group": sorted(allocated_current),
                "available_courses": display_available,
                "double_count_groups": sorted(allowed_for_double)
            }

            if debug:
                print(f"[DEBUG:MAJOR] {group_name} => allocated={allocated_current}, taken_credits={taken_credits}")

    if full_view:
        print("\n========== CORE REQUIREMENTS ==========")
        for grp_name, info in core_requirements.items():
            print(f"Group: {grp_name}")
            print(f"  JSON Group ID: {info['json_id']}")
            print(f"  Required Credits: {info['required_credits']}")
            print(f"  Taken Credits: {info['taken_credits']}")
            print(f"  Remaining Credits: {info['remaining_credits']}")
            print(f"  Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")

            if isinstance(info["available_courses"], list):
                if len(info["available_courses"]) > 0:
                    print(f"  Available Courses: {', '.join(info['available_courses'])}")
                else:
                    print("  Available Courses: []")
            else:
                print(f"  Available Courses: {info['available_courses']}")

            if info.get('expected_attribute'):
                print(f"  (Core Attribute Used: {info['expected_attribute']})")
            print("--------------------------------------------------")

        print("\n========== MAJOR REQUIREMENTS ==========")
        for grp_name, info in major_requirements.items():
            print(f"Group: {grp_name}")
            print(f"  JSON Group ID: {info['json_id']}")
            print(f"  Required Credits: {info['required_credits']}")
            print(f"  Taken Credits: {info['taken_credits']}")
            print(f"  Remaining Credits: {info['remaining_credits']}")
            print(f"  Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")

            if isinstance(info["available_courses"], list):
                if len(info["available_courses"]) > 0:
                    print(f"  Available Courses: {', '.join(info['available_courses'])}")
                else:
                    print("  Available Courses: []")

            if info['double_count_groups']:
                print(f"  Can double count with groups: {info['double_count_groups']}")
            print("--------------------------------------------------")

    return {
        "core_requirements": core_requirements,
        "major_requirements": major_requirements
    }

def has_completed_prerequisites(student_id: int, course_code: str, debug: bool = False) -> bool:
    prerequisites = get_course_prerequisites(course_code)
    if not prerequisites:
        if debug:
            print(f"[PREREQ] {course_code}: нет пререквизитов")
        return True

    resp = supabase.table("enrollments") \
        .select("section_id") \
        .eq("user_id", student_id) \
        .execute()
    section_ids = [row["section_id"] for row in (resp.data or [])]
    if not section_ids:
        if debug:
            print(f"[PREREQ] {course_code}: нет ни одной записи в enrollments")
        return False

    resp2 = supabase.table("sections") \
        .select("course_id") \
        .in_("section_id", section_ids) \
        .execute()
    completed_courses = {row["course_id"] for row in (resp2.data or [])}

    missing = [pr for pr in prerequisites if pr not in completed_courses]
    if debug:
        print(f"[PREREQ] Проверка для {course_code}:")
        print(f"  Требуются: {prerequisites}")
        print(f"  Есть у студента: {sorted(completed_courses)}")
        if not missing:
            print(f"  -> OK: все пререквизиты выполнены")
        else:
            print(f"  -> NOT OK: не хватает {missing}")

    return all(prereq in completed_courses for prereq in prerequisites)

def get_course_level(course_code):
    m = re.match(r"([A-Z]+)\s*(\d+)", course_code)
    if not m:
        return None, None
    subject = m.group(1)
    number = int(m.group(2))
    level = (number // 100) * 100
    return subject, level

def has_lower_level_course(student_courses, subject, level, debug=False):
    if level < 200:
        return True
    required_level = level - 100
    for code in student_courses:
        subj, lvl = get_course_level(code)
        if subj == subject and lvl == required_level:
            if debug:
                print(f"[DEBUG:LEVEL] {subject} {level} can be taken because student has {code}")
            return True
    if debug:
        print(f"[DEBUG:LEVEL] {subject} {level} cannot be taken because student lacks a {subject} {required_level} course")
    return False

def get_lab_pair(course_code):
    import re
    LAB_SUBJECTS = {"BIOL", "CHEM", "PHYS"}
    m = re.match(r"([A-Z]+)\s*(\d+)(L?)", course_code)
    if not m:
        return None
    subject = m.group(1)
    number = m.group(2)
    is_lab = m.group(3) == "L"
    if subject not in LAB_SUBJECTS:
        return None
    if is_lab:
        return f"{subject} {number}"
    else:
        return f"{subject} {number}L"

def plan_next_semester_bruteforce(
    student_id: int,
    major_program_name: str,
    core_program_name: str = "University Core Requirements",
    next_term: str = "Fall 2025",
    max_credits_per_semester: int = 18,
    debug: bool = False
) -> list:
    """
    Составляет расписание на следующий семестр с учётом групповых требований и prerequisites.
    Балансирует: 30-50% уникальных курсов должны быть core.
    """
    requirements = get_merged_requirements_for_student(
        student_id=student_id,
        major_program_name=major_program_name,
        core_program_name=core_program_name,
        full_view=False,
        debug=debug
    )
    major_reqs = requirements["major_requirements"]
    core_reqs = requirements["core_requirements"]
    plan = []
    total_credits = 0
    used_courses = set()
    used_core = set()
    used_major = set()

    resp_enroll = supabase.table("enrollments") \
        .select("section_id") \
        .eq("user_id", student_id) \
        .execute()

    enrolled_section_ids = [row["section_id"] for row in resp_enroll.data or []]

    if enrolled_section_ids:
        resp_courses = supabase.table("sections") \
            .select("course_id") \
            .in_("section_id", enrolled_section_ids) \
            .execute()
        taken_courses_major = {row["course_id"] for row in resp_courses.data or []}
    else:
        taken_courses_major = set()

    if debug:
        print(f"[DEBUG] Student has already taken these courses: {sorted(taken_courses_major)}")

    available_major = []
    for group_name, info in major_reqs.items():
        needed = info["remaining_credits"]
        if needed <= 0:
            continue
        available_courses = info["available_courses"]
        if not available_courses:
            continue
        for course_code in available_courses:
            if course_code in taken_courses_major:
                if debug:
                    print(f"[DEBUG] Excluding {course_code} from available_major because it has already been taken")
                continue
            available_major.append((course_code, group_name, info))

    available_core = []
    for group_name, info in core_reqs.items():
        needed = info["remaining_credits"]
        if needed <= 0:
            continue
        available = info["available_courses"]
        if isinstance(available, str) and available.startswith("CORE "):
            attr_needed = info.get("expected_attribute")
            if attr_needed:
                resp = supabase.table("sections") \
                    .select("section_id, course_id, credits, attribute, term") \
                    .eq("term", next_term) \
                    .execute()
                for row in (resp.data or []):
                    attr_str = row.get("attribute", "") or ""
                    if f"Core: {attr_needed}" in attr_str:
                        course_code = row["course_id"]
                        if course_code in taken_courses_major:
                            if debug:
                                print(f"[DEBUG] Excluding {course_code} from available_core because it has already been taken")
                            continue
                        available_core.append((course_code, group_name, info))
        elif isinstance(available, list):
            for course_code in available:
                if course_code in taken_courses_major:
                    if debug:
                        print(f"[DEBUG] Excluding {course_code} from available_core because it has already been taken")
                    continue
                available_core.append((course_code, group_name, info))
    available_major = list({c[0]: c for c in available_major}.values())
    available_core = list({c[0]: c for c in available_core}.values())

    if debug:
        courses_to_check = ["CPSC 223", "CPSC 224", "CPSC 260"]
        print("\n[DEBUG] Checking section availability for specific courses:")
        for course in courses_to_check:
            resp = supabase.table("sections") \
                .select("section_id, course_id, credits, term") \
                .eq("course_id", course) \
                .eq("term", next_term) \
                .execute()

            if resp.data:
                print(f"  - {course}: {len(resp.data)} sections available for {next_term}")
            else:
                print(f"  - {course}: NO SECTIONS AVAILABLE for {next_term}")

    if debug:
        courses_in_available = []
        for course_code, _, _ in available_major:
            if course_code in ["CPSC 223", "CPSC 224", "CPSC 260"]:
                courses_in_available.append(course_code)

        if courses_in_available:
            print(f"[DEBUG] Courses in available_major: {', '.join(courses_in_available)}")
        else:
            print("[DEBUG] None of CPSC 223, CPSC 224, CPSC 260 are in available_major!")

    REQUIRED_MATH = "MATH 147"
    while total_credits < max_credits_per_semester:
        unique_courses = used_major | used_core
        n_total = len(unique_courses) if unique_courses else 1
        n_core = len(used_core)
        core_ratio = n_core / n_total
        if REQUIRED_MATH not in used_courses and REQUIRED_MATH not in taken_courses_major and not any(item['course_id'] == REQUIRED_MATH for item in plan):
            resp = supabase.table("sections") \
                .select("section_id, course_id, credits, attribute, term") \
                .eq("course_id", REQUIRED_MATH) \
                .eq("term", next_term) \
                .execute()
            if resp.data:
                section_info = resp.data[0]
                sec_id = section_info["section_id"]
                sec_credits = section_info.get("credits", 0)
                if total_credits + sec_credits <= max_credits_per_semester:
                    plan.append({
                        "section_id": sec_id,
                        "course_id": REQUIRED_MATH,
                        "credits": sec_credits,
                        "group": "Math Requirement",
                        "type": "major"
                    })
                    total_credits += sec_credits
                    used_courses.add(REQUIRED_MATH)
                    used_major.add(REQUIRED_MATH)
                    continue

        credits_remaining = max_credits_per_semester - total_credits
        near_target = credits_remaining <= 6

        if not near_target:
            if core_ratio < 0.3 and available_core:
                pool = available_core
                pool_type = 'core'
            elif core_ratio > 0.5 and available_major:
                pool = available_major
                pool_type = 'major'
            else:
                if len(available_major) >= len(available_core):
                    pool = available_major if available_major else available_core
                    pool_type = 'major' if available_major else 'core'
                else:
                    pool = available_core if available_core else available_major
                    pool_type = 'core' if available_core else 'major'
        else:
            if available_major:
                pool = available_major
                pool_type = 'major'
            else:
                pool = available_core
                pool_type = 'core'

            if debug:
                print(f"[DEBUG] Near target credits ({total_credits}/{max_credits_per_semester}), prioritizing any available courses")

        added = False
        for idx, (course_code, group_name, info) in enumerate(pool):
            if course_code in taken_courses_major:
                if debug:
                    print(f"[DEBUG] Skipping {course_code} because student has already taken it")
                continue

            if course_code in used_courses:
                continue

            is_cpsc_course = course_code.startswith("CPSC")

            m = re.match(r"MATH\s*(\d+)", course_code)
            if m and int(m.group(1)) < 147:
                continue

            subject, level = get_course_level(course_code)

            level_check_passed = True
            if level and level >= 200:
                if not has_lower_level_course(used_courses | taken_courses_major, subject, level, debug):
                    if not (near_target and is_cpsc_course):
                        level_check_passed = False
                        if debug and near_target and is_cpsc_course:
                            print(f"[DEBUG] Relaxing level check for {course_code} to reach credit target")

            if not level_check_passed:
                continue

            lab_pair = get_lab_pair(course_code)
            if lab_pair:
                already_taken = (lab_pair in used_courses or lab_pair in taken_courses_major)
                in_plan = any(item['course_id'] == lab_pair for item in plan)
                if not (already_taken or in_plan):
                    continue

            prereq_check_passed = has_completed_prerequisites(student_id, course_code, debug=debug)
            if not prereq_check_passed:
                if near_target and is_cpsc_course:
                    prereq_check_passed = True
                    if debug:
                        print(f"[DEBUG] Relaxing prerequisite check for {course_code} to reach credit target")

            if not prereq_check_passed:
                continue

            resp = supabase.table("sections") \
                .select("section_id, course_id, credits, attribute, term") \
                .eq("course_id", course_code) \
                .eq("term", next_term) \
                .execute()
            if not resp.data:
                continue
            section_info = resp.data[0]
            sec_id = section_info["section_id"]
            sec_credits = section_info.get("credits", 0)
            if total_credits + sec_credits > max_credits_per_semester:
                continue
            plan.append({
                "section_id": sec_id,
                "course_id": course_code,
                "credits": sec_credits,
                "group": group_name,
                "type": pool_type
            })
            total_credits += sec_credits
            used_courses.add(course_code)
            if pool_type == 'core':
                used_core.add(course_code)
            else:
                used_major.add(course_code)
            del pool[idx]
            added = True
            break
        if not added:
            break

    if total_credits < max_credits_per_semester and debug:
        print("\n[DEBUG] After normal planning, only reached", total_credits, "credits")
        print("[DEBUG] Looking for additional CPSC courses specifically")

        if debug:
            for course in ["CPSC 223", "CPSC 224", "CPSC 260"]:
                if course in taken_courses_major:
                    print(f"[DEBUG] {course} is already taken by student")

        priority_courses = ["CPSC 223", "CPSC 224", "CPSC 260"]
        for course_code in priority_courses:
            if course_code in used_courses or course_code in taken_courses_major:
                if debug:
                    if course_code in taken_courses_major:
                        print(f"[DEBUG] Skipping {course_code} because student has already taken it")
                    else:
                        print(f"[DEBUG] Skipping {course_code} because it's already in the plan")
                continue

            print(f"[DEBUG] Trying to add {course_code} directly...")

            resp = supabase.table("sections") \
                .select("section_id, course_id, credits, term") \
                .eq("course_id", course_code) \
                .eq("term", next_term) \
                .execute()

            if resp.data:
                section_info = resp.data[0]
                sec_id = section_info["section_id"]
                sec_credits = section_info.get("credits", 0)

                if total_credits + sec_credits <= max_credits_per_semester:
                    print(f"[DEBUG] Found section for {course_code}, adding it directly")
                    plan.append({
                        "section_id": sec_id,
                        "course_id": course_code,
                        "credits": sec_credits,
                        "group": "lower Division",
                        "type": "major"
                    })
                    total_credits += sec_credits
                    used_courses.add(course_code)
                    used_major.add(course_code)
                else:
                    print(f"[DEBUG] Adding {course_code} would exceed the credit limit")
            else:
                print(f"[DEBUG] No sections available for {course_code} in {next_term}")

    if debug:
        unique_courses = used_major | used_core
        n_core = len(used_core)
        print(f"[DEBUG] Итог: {n_core} core из {len(unique_courses)} уникальных курсов ({(n_core/len(unique_courses)*100 if unique_courses else 0):.1f}%)")
        print(f"[DEBUG] Total planned credits = {total_credits}")
        print("\nProposed schedule:")
        for item in plan:
            print(f"  - {item['course_id']} ({item['credits']} credits) for {item['group']} ({item['type']})")
    return plan

if __name__ == "__main__":
    result = get_merged_requirements_for_student(
        student_id=1,
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        full_view=True,
        debug=False
    )

    schedule = plan_next_semester_bruteforce(
        student_id=1,
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        next_term="Fall 2025",
        max_credits_per_semester=18,
        debug=True
    )
