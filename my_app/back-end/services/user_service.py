import bcrypt
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_user(user_name: str, email: str, password: str, name: str) -> dict:
    """
    Creates a new user in the 'users' table with a unique user_name, a hashed password, and a display name.
    Automatically assigns user_id (auto-increment).
    Returns the inserted user data or an error if user_name is already taken.
    """

    check_response = supabase.from_('users').select('*').eq('user_name', user_name).execute()
    if check_response.data:
        return {"error": f"user_name '{user_name}' is already in use."}

    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    insert_data = {
        "user_name": user_name,
        "email": email,
        "password": hashed_password,
        "name": name
    }
    response = supabase.from_('users').insert(insert_data).execute()

    if not response.data or "error" in response.data:
        return {"error": response.data.get("error", "Unknown insert error")}


    return {"data": response.data}

def check_login(user_name: str, password: str) -> dict:
    """
    Checks user's login credentials by comparing the provided password
    with the hashed password in the 'users' table (matched by user_name).
    Returns user data if successful, or an error otherwise.
    """
    try:
        response = supabase.from_('users').select('*').eq('user_name', user_name).single().execute()

        if not response.data:
            return {"error": "User not found"}

        user_record = response.data
        stored_hashed_password = user_record['password']

        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            user_data = dict(user_record)
            user_data.pop('password', None)
            return {"data": user_data}
        else:
            return {"error": "Invalid credentials"}

    except Exception as e:
        print(f"Login error: {str(e)}")
        return {"error": "An error occurred during login"}

def add_class_enrollment(
    user_id: int,
    in_process: bool,
    section_id: int = None,
    crn: str = None,
    course_id: str = None,
    term: str = None,
    section: str = None
) -> dict:
    """
    Универсальная функция добавления класса (секции) для пользователя.
    Может работать в нескольких режимах:
      1) Если передан section_id — ищет секцию по section_id.
      2) Если передан crn — ищет секцию по crn.
      3) Если переданы course_id, term, section:
         - Пытается найти точное совпадение
         - Если не находит, ищет другую секцию в том же term
         - Если не находит, ищет любую секцию по course_id (любой term)

    :param user_id:    ID пользователя
    :param in_process: Флаг, указывающий, находится ли курс в процессе (True/False)
    :param section_id: (опционально) ID секции
    :param crn:        (опционально) CRN секции
    :param course_id:  (опционально) ID курса
    :param term:       (опционально) Семестр/термин (например, "2023FA")
    :param section:    (опционально) Обозначение секции (например, "A", "B", "01")
    :return:           Словарь с результатом операции {"success": "..."} или {"error": "..."}
    """

    user_check = supabase.table("users").select("user_id").eq("user_id", user_id).execute()
    if not user_check.data:
        return {"error": f"User with ID {user_id} not found."}

    found_section_id = None
    found_course_id = None
    fallback_info = ""

    if section_id is not None:
        section_query = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("section_id", section_id)
            .execute()
        )
        if not section_query.data:
            return {"error": f"Section with section_id={section_id} not found."}

        found_section_id = section_query.data[0]["section_id"]
        found_course_id = section_query.data[0]["course_id"]

    elif crn is not None:
        section_query = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("crn", crn)
            .execute()
        )
        if not section_query.data:
            return {"error": f"Section with CRN={crn} not found."}

        found_section_id = section_query.data[0]["section_id"]
        found_course_id = section_query.data[0]["course_id"]

    elif course_id and term and section:
        exact_match = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("course_id", course_id)
            .eq("term", term)
            .eq("section", section)
            .execute()
        )
        if exact_match.data:
            found_section_id = exact_match.data[0]["section_id"]
            found_course_id = exact_match.data[0]["course_id"]
        else:
            same_term_match = (
                supabase.table("sections")
                .select("section_id, course_id")
                .eq("course_id", course_id)
                .eq("term", term)
                .execute()
            )
            if same_term_match.data:
                found_section_id = same_term_match.data[0]["section_id"]
                found_course_id = same_term_match.data[0]["course_id"]
                fallback_info = (
                    f"In place of section '{section}' in term '{term}', section "
                    f"{found_section_id} (in the same term) is selected."
                )
            else:
                any_term_match = (
                    supabase.table("sections")
                    .select("section_id, course_id, term, section")
                    .eq("course_id", course_id)
                    .execute()
                )
                if any_term_match.data:
                    found_section_id = any_term_match.data[0]["section_id"]
                    found_course_id = any_term_match.data[0]["course_id"]
                    alt_term = any_term_match.data[0]["term"]
                    alt_section = any_term_match.data[0]["section"]
                    fallback_info = (
                        f"In place of term '{term}' and section '{section}', section "
                        f"{found_section_id} (term='{alt_term}', section='{alt_section}')."
                    )
                else:
                    return {
                        "error": (
                            f"Section (course_id={course_id}, term={term}, section={section}) not found. "
                            f"No alternative sections in this term or others."
                        )
                    }
    else:
        return {
            "error": (
                "No valid way to find section specified. "
                "Provide one of the following:\n"
                "  - section_id\n"
                "  - crn\n"
                "  - (course_id, term, section) (with fallback search)"
            )
        }

    enrollment_check = (
        supabase.table("enrollments")
        .select("section_id")
        .eq("user_id", user_id)
        .execute()
    )

    if enrollment_check.data:
        enrolled_section_ids = {record["section_id"] for record in enrollment_check.data}

        existing_course_check = (
            supabase.table("sections")
            .select("section_id")
            .eq("course_id", found_course_id)
            .in_("section_id", list(enrolled_section_ids))
            .execute()
        )

        if existing_course_check.data:
            return {
                "error": (
                    f"User {user_id} is already enrolled in course {found_course_id} "
                    f"in section {existing_course_check.data[0]['section_id']}."
                )
            }

    insert_data = {
        "user_id": user_id,
        "section_id": found_section_id,
        "in_process": in_process
    }
    response = supabase.table("enrollments").insert(insert_data).execute()

    if not response.data:
        return {
            "error": "Failed to add record to enrollments. Supabase response: " + str(response)
        }

    success_message = (
        f"User {user_id} successfully enrolled in section {found_section_id} "
        f"of course {found_course_id}. in_process={in_process}"
    )
    if fallback_info:
        success_message += " " + fallback_info

    return {"success": success_message}

result = add_class_enrollment(
    user_id=1,
    in_process=False,
    course_id="CPSC 121",
    term="Spring 2024",
    section="01"
)
print(result)





def get_user_enrollments(user_id: int) -> list:
    enrollments = supabase.table("enrollments").select("section_id").eq("user_id", user_id).execute()
    if not enrollments.data:
        return []
    section_ids = [e["section_id"] for e in enrollments.data]
    if not section_ids:
        return []
    sections = supabase.table("sections").select("*").in_("section_id", section_ids).execute()
    return sections.data or []
