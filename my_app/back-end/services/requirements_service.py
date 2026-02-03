from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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

    taken_courses_major = list(taken_courses_major)

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