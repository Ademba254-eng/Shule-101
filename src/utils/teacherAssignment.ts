import { AssignedTeacherInfo, GradeLevel, Section } from '../types';

/**
 * Returns the appropriate assigned class teacher based on student grade and stream.
 * Automatically places students onto their class teacher's active roll and register.
 */
export function getTeacherForGradeAndSection(
  grade: GradeLevel | string,
  section: Section | string = 'A'
): AssignedTeacherInfo {
  const normalizedGrade = grade.startsWith('Grade') ? grade : `Grade ${grade}`;
  const targetClass = `${normalizedGrade}-${section}`;

  if (normalizedGrade === 'Grade 9') {
    return {
      id: 'usr-teacher-9a',
      name: 'Mrs. Sarah Jenkins',
      email: 'teacher.jenkins@shule101.edu',
      title: `Class Teacher (${targetClass}) • Performance & Attendance Register`,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      assignedClass: targetClass,
    };
  }

  if (normalizedGrade === 'Grade 10') {
    return {
      id: 'usr-teacher-10a',
      name: 'Mr. David Mwangi',
      email: 'teacher.mwangi@shule101.edu',
      title: `Class Teacher (${targetClass}) • Performance & Attendance Register`,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      assignedClass: targetClass,
    };
  }

  if (normalizedGrade === 'Grade 11') {
    return {
      id: 'usr-teacher-11a',
      name: 'Mr. Ronald Keller',
      email: 'teacher.keller@shule101.edu',
      title: `Class Teacher (${targetClass}) • Performance & Attendance Register`,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      assignedClass: targetClass,
    };
  }

  // Grade 12 or default senior stream
  return {
    id: 'usr-teacher-12a',
    name: 'Prof. Clara Higgins',
    email: 'teacher.higgins@shule101.edu',
    title: `Class Teacher (${targetClass}) • Performance & Attendance Register`,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    assignedClass: targetClass,
  };
}
