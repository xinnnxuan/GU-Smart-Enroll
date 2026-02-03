from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
from combo import get_merged_requirements_for_student 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def plan_next_semester_schedule(
    student_id: int,
    major_program_name: str,
    core_program_name: str = "University Core Requirements",
    next_term: str = "Fall 2025",
    max_credits_per_semester: int = 18,
    debug: bool = False
) -> list:
    """
    Возвращает список (план) курсов (секций) на следующий семестр (next_term),
    не превышая max_credits_per_semester (по умолчанию 18).

    Логика:
      1) Получаем требования (Major + Core) через get_merged_requirements_for_student.
      2) Сначала планируем Major, пока не упремся в 18 кредитов или не закроем Major-требования.
         - Для каждого потенциального course_id ищем в таблице sections => term=next_term.
           Если находим, берём credits из sections.
      3) Затем планируем Core. Если для группы available_courses = "CORE X", ищем любую секцию,
         где attribute содержит "Core: X" и term=next_term. Если не нашли, добавляем плейсхолдер.
      4) Возвращаем список словарей:
         [
           {
             "section_id": ...,
             "course_id": "CPSC 346",
             "credits": 3,
             "group": "upper Division"
           },
           ...
         ]
         Или [{"course_id": "(Placeholder) Core attribute: Philosophy", "credits": 3, "group": "Philosophy Core"}].
    """

    # 1) Получаем структуру требований
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

    # =========================================================================
    # ШАГ 2. СНАЧАЛА MAJOR
    # =========================================================================
    for group_name, info in major_reqs.items():
        needed = info["remaining_credits"]
        if needed <= 0:
            continue  # уже закрыто

        # Список доступных course_id
        available_courses = info["available_courses"]

        for course_code in available_courses:
            if total_credits >= max_credits_per_semester:
                break
            if needed <= 0:
                break

            # Ищем секцию в таблице sections, где course_id=course_code и term=next_term
            resp = supabase.table("sections") \
                .select("section_id, course_id, credits, attribute, term") \
                .eq("course_id", course_code) \
                .eq("term", next_term) \
                .execute()
            if not resp.data:
                # Нет секции в этом семестре
                if debug:
                    print(f"[DEBUG] No section for {course_code} in {next_term}")
                continue

            # Возьмём первую попавшуюся секцию (упрощённо)
            section_info = resp.data[0]
            sec_id = section_info["section_id"]
            sec_credits = section_info.get("credits", 0)

            if total_credits + sec_credits > max_credits_per_semester:
                continue  # превысим лимит

            # Добавляем в план
            plan.append({
                "section_id": sec_id,
                "course_id": course_code,
                "credits": sec_credits,
                "group": group_name
            })
            total_credits += sec_credits
            needed -= sec_credits

        if debug and needed > 0:
            print(f"[DEBUG] After group '{group_name}', still need {needed} credits.")

    # =========================================================================
    # ШАГ 3. ЗАТЕМ CORE
    # =========================================================================
    for group_name, info in core_reqs.items():
        needed = info["remaining_credits"]
        if needed <= 0:
            continue

        available = info["available_courses"]

        # Проверяем, не является ли это "CORE X" (строка)
        attr_needed = None
        if isinstance(available, str) and available.startswith("CORE "):
            attr_needed = info.get("expected_attribute")  # Например "Philosophy"

        # 3.1) Если это список курсов (не core-строка)
        if isinstance(available, list):
            for course_code in available:
                if total_credits >= max_credits_per_semester:
                    break
                if needed <= 0:
                    break

                # Ищем в sections
                resp = supabase.table("sections") \
                    .select("section_id, course_id, credits, attribute, term") \
                    .eq("course_id", course_code) \
                    .eq("term", next_term) \
                    .execute()
                if not resp.data:
                    continue
                section_info = resp.data[0]
                sec_id = section_info["section_id"]
                sec_credits = section_info["credits"]
                if total_credits + sec_credits > max_credits_per_semester:
                    continue

                plan.append({
                    "section_id": sec_id,
                    "course_id": course_code,
                    "credits": sec_credits,
                    "group": group_name
                })
                total_credits += sec_credits
                needed -= sec_credits

        # 3.2) Если это строка вида "CORE 3" => ищем секции с "Core: attr_needed"
        if attr_needed and needed > 0:
            # Пока есть нужные кредиты и не достигли лимита
            while needed > 0 and total_credits < max_credits_per_semester:
                # Ищем любую секцию, где attribute (поле sections.attribute) содержит "Core: attr_needed"
                # Предположим, attribute — это текст, возможно через запятую.
                # Ниже — упрощённый вариант: загружаем все секции этого term, фильтруем в Python.
                resp = supabase.table("sections") \
                    .select("section_id, course_id, credits, attribute, term") \
                    .eq("term", next_term) \
                    .execute()
                found_section = None
                for row in (resp.data or []):
                    attr_str = row.get("attribute") or ""
                    # Допустим, мы ищем строку "Core: {attr_needed}"
                    # Если attr_str хранит несколько через запятую, нужно проверить каждую.
                    # Упрощённо:
                    #    if f"Core: {attr_needed}" in attr_str
                    # Или если attribute хранится в массиве _text, нужно итерироваться.
                    # Ниже — вариант поиска по подстроке:
                    if f"Core: {attr_needed}" in attr_str:
                        sec_credits = row.get("credits", 0)
                        if total_credits + sec_credits <= max_credits_per_semester:
                            found_section = row
                            break
                if found_section:
                    plan.append({
                        "section_id": found_section["section_id"],
                        "course_id": found_section["course_id"],
                        "credits": found_section["credits"],
                        "group": group_name
                    })
                    total_credits += found_section["credits"]
                    needed -= found_section["credits"]
                else:
                    # Не нашли реального курса => добавляем плейсхолдер
                    # Скажем, на 3 кредита
                    placeholder_credits = 3
                    if total_credits + placeholder_credits > max_credits_per_semester:
                        break
                    plan.append({
                        "section_id": None,
                        "course_id": f"(Placeholder) Core attribute: {attr_needed}",
                        "credits": placeholder_credits,
                        "group": group_name
                    })
                    total_credits += placeholder_credits
                    needed -= placeholder_credits

    if debug:
        print(f"[DEBUG] Total planned credits = {total_credits}")

    return plan

# ---------------------------
# Пример использования
# ---------------------------
if __name__ == "__main__":
    schedule = plan_next_semester_schedule(
        student_id=1,
        major_program_name="B.S. Computer Science - Data Science Concentration",
        core_program_name="University Core Requirements",
        next_term="Fall 2025",
        max_credits_per_semester=18,
        debug=True
    )
    print("\nProposed schedule for next semester:")
    total = 0
    for item in schedule:
        sec_id = item["section_id"] or "N/A"
        print(f"  - Section={sec_id}, Course={item['course_id']} "
              f"({item['credits']} credits) for group '{item['group']}'")
        total += item['credits']
    print(f"TOTAL CREDITS: {total}")