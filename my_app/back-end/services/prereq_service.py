import json
from typing import Optional, Dict, Set, List
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_prerequisite_graph(
    course_code: str,
    include_all_levels: bool = False,
    visited: Optional[Set[str]] = None,
    nodes: Optional[List[Dict]] = None,
    edges: Optional[List[Dict]] = None
) -> Dict:
    """
    Рекурсивно строит граф пререквизитов для заданного course_code.

    Возвращает словарь вида:
        {
            "nodes": [
                {"id": "CPSC 321", "name": "Database Management Systems"},
                {"id": "CPSC 122", "name": "Computational Thinking"},
                ...
            ],
            "edges": [
                {"source": "CPSC 122", "target": "CPSC 321", "relation": "and/or", "min_grade": "D"},
                ...
            ]
        }

    Параметры:
        course_code (str): Код курса (например, "CPSC 321").
        include_all_levels (bool): Если True, то рекурсивно подтягивает все уровни пререквизитов.
        visited (Set[str]): Множество уже посещённых курсов (для защиты от циклов).
        nodes (List[Dict]): Список узлов (накопленный).
        edges (List[Dict]): Список рёбер (накопленный).
    """

    if visited is None:
        visited = set()
    if nodes is None:
        nodes = []
    if edges is None:
        edges = []

    if course_code in visited:
        return {"nodes": nodes, "edges": edges}

    visited.add(course_code)

    course_info = supabase.table("courses").select("*").eq("code", course_code).execute()
    if course_info.data and len(course_info.data) > 0:
        course_title = course_info.data[0].get("title", course_code)
    else:
        course_title = course_code

    if not any(n["id"] == course_code for n in nodes):
        nodes.append({"id": course_code, "name": course_title})

    response = supabase.table("prerequisites").select("*").eq("course_code", course_code).execute()
    if not response.data:
        return {"nodes": nodes, "edges": edges}

    for record in response.data:
        prereq_json = record.get("prerequisite_schema")
        if not prereq_json:
            continue

        if isinstance(prereq_json, str):
            prereq_data = json.loads(prereq_json)
        else:
            prereq_data = prereq_json

        if "requirements" in prereq_data:
            prereq_type = prereq_data.get("type", "and")
            requirements = prereq_data.get("requirements", [])
        else:
            prereq_type = prereq_data.get("type", "and")
            requirements = [prereq_data]

        for req in requirements:
            child_course = req.get("course")
            min_grade = req.get("min_grade")

            if not child_course:
                continue

            child_info = supabase.table("courses").select("*").eq("code", child_course).execute()
            if child_info.data and len(child_info.data) > 0:
                child_title = child_info.data[0].get("title", child_course)
            else:
                child_title = child_course

            if not any(n["id"] == child_course for n in nodes):
                nodes.append({"id": child_course, "name": child_title})

            edges.append({
                "source": child_course,
                "target": course_code,
                "relation": prereq_type,
                "min_grade": min_grade
            })

            if include_all_levels:
                build_prerequisite_graph(
                    course_code=child_course,
                    include_all_levels=True,
                    visited=visited,
                    nodes=nodes,
                    edges=edges
                )

    return {"nodes": nodes, "edges": edges}


if __name__ == "__main__":
    result_one_level = build_prerequisite_graph("MATH 260", include_all_levels=False)
    print("One-level prerequisite graph (MATH 260):", result_one_level)

    result_all_levels = build_prerequisite_graph("MATH 260", include_all_levels=True)
    print("All-levels prerequisite graph (MATH 260):", result_all_levels)
