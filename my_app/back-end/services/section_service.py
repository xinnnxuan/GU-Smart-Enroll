
from typing import Optional
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_sections(subject: Optional[str] = None,
                    course_code: Optional[str] = None,
                    attribute: Optional[str] = None,
                    instructor: Optional[str] = None,
                    term: Optional[str] = "Fall 2025") -> dict:
    """
    Ищет записи в таблице 'sections' и возвращает данные в том формате,
    который ожидает фронтенд (section_number, schedule, instructor и т.д.).
    """

    query = supabase.table('sections').select('*')

    if term:
        query = query.eq('term', term)
    if subject:
        query = query.eq('subject', subject)
    if course_code:
        query = query.eq('course_code', course_code)
    if attribute:
        query = query.ilike('attribute', f'%{attribute}%')
    if instructor:
        query = query.ilike('instructor_id', f'%{instructor}%')

    response = query.execute()
    raw_data = response.data

    transformed_data = []
    for row in raw_data:

        days = row.get('days') or ''
        time_slot = row.get('time_slot') or ''
        schedule_str = (days + ' ' + time_slot).strip()
        if not schedule_str:
            schedule_str = 'Not specified'

        seats_avail = row.get('rm') or 0
        seats_used = row.get('act') or 0
        total_seats = seats_avail + seats_used

        new_row = {
            "section_number": row.get('section') or '',
            "subject": row.get('subject') or '',
            "course_code": row.get('course_code') or '',

            "schedule": schedule_str,

            "instructor": row.get('instructor_id') or 'TBA',

            "location": row.get('classroom') or 'TBA',

            "credits": row.get('credits') or '?',

            "seats_available": seats_avail,
            "total_seats": total_seats,
        }
        transformed_data.append(new_row)

    return {"data": transformed_data}


if __name__ == "__main__":
    result = search_sections(subject="CPSC", course_code="260")
    print(result)