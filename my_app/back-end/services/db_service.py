from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class DatabaseService:
    @staticmethod
    def get_courses():
        try:
            response = supabase.from_('courses').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching courses: {str(e)}")
            return None

    @staticmethod
    def get_sections(course_id):
        try:
            response = supabase.from_('sections').select('*').eq('course_id', course_id).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching sections for course {course_id}: {str(e)}")
            return None

    @staticmethod
    def get_professors():
        try:
            response = supabase.from_('professors').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching professors: {str(e)}")
            return None

    @staticmethod
    def search_courses(query):
        try:
            response = supabase.from_('courses').select('*').ilike('subject', f'%{query}%').execute()
            results = response.data or []
            response2 = supabase.from_('courses').select('*').ilike('course_code', f'%{query}%').execute()
            if response2.data:
                existing_ids = {c['id'] for c in results if 'id' in c}
                for c in response2.data:
                    if 'id' in c and c['id'] not in existing_ids:
                        results.append(c)
            return results
        except Exception as e:
            print(f"Error searching courses: {str(e)}")
            return []