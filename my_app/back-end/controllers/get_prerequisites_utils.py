import json
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

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

if __name__ == "__main__":
    print(get_course_prerequisites("CPSC 321"))

