import {
  Student,
  StudentAcademicRecord,
  DailyAttendanceEntry,
  FeeInvoice,
  DirectMessage,
  MessageThread,
  SchoolAnnouncement,
} from '../types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    admissionNo: 'ADM-2024-001',
    rollNumber: '10A-01',
    firstName: 'Liam',
    lastName: 'Davis',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Male',
    dob: '2010-04-12',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    enrollmentDate: '2023-09-01',
    guardian: {
      name: 'Eleanor Davis',
      relation: 'Mother',
      phone: '+1 (555) 234-8901',
      email: 'eleanor.davis@example.com',
      address: '742 Evergreen Terrace, Springfield',
      occupation: 'Architect',
    },
  },
  {
    id: 'std-2',
    admissionNo: 'ADM-2024-002',
    rollNumber: '10A-02',
    firstName: 'Sophia',
    lastName: 'Chen',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Female',
    dob: '2010-08-21',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    enrollmentDate: '2023-09-01',
    guardian: {
      name: 'Marcus Chen',
      relation: 'Father',
      phone: '+1 (555) 456-7812',
      email: 'marcus.chen@example.com',
      address: '124 Blossom Hill Road, Suite 4B',
      occupation: 'Software Director',
    },
  },
  {
    id: 'std-3',
    admissionNo: 'ADM-2024-003',
    rollNumber: '10A-03',
    firstName: 'Noah',
    lastName: 'Patel',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Male',
    dob: '2010-02-15',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'B+',
    enrollmentDate: '2023-09-01',
    guardian: {
      name: 'Ananya Patel',
      relation: 'Mother',
      phone: '+1 (555) 876-5432',
      email: 'ananya.patel@example.com',
      address: '88 Oakridge Boulevard, North Hills',
      occupation: 'Pharmacist',
    },
  },
  {
    id: 'std-4',
    admissionNo: 'ADM-2024-004',
    rollNumber: '10A-04',
    firstName: 'Emma',
    lastName: 'Wilson',
    grade: 'Grade 10',
    section: 'A',
    gender: 'Female',
    dob: '2010-11-04',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'AB-',
    enrollmentDate: '2023-09-01',
    guardian: {
      name: 'David Wilson',
      relation: 'Father',
      phone: '+1 (555) 345-9012',
      email: 'david.wilson@example.com',
      address: '312 Elm Street, Maplewood',
      occupation: 'Civil Engineer',
    },
  },
  {
    id: 'std-5',
    admissionNo: 'ADM-2024-005',
    rollNumber: '10B-01',
    firstName: 'Lucas',
    lastName: 'Ramirez',
    grade: 'Grade 10',
    section: 'B',
    gender: 'Male',
    dob: '2010-06-19',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'O-',
    enrollmentDate: '2023-09-01',
    guardian: {
      name: 'Elena Ramirez',
      relation: 'Mother',
      phone: '+1 (555) 678-1234',
      email: 'elena.ramirez@example.com',
      address: '45 Sunset Way, Crestview',
      occupation: 'Accountant',
    },
  },
  {
    id: 'std-6',
    admissionNo: 'ADM-2024-006',
    rollNumber: '11A-01',
    firstName: 'Maya',
    lastName: 'Al-Mansoor',
    grade: 'Grade 11',
    section: 'A',
    gender: 'Female',
    dob: '2009-03-30',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'A-',
    enrollmentDate: '2022-09-01',
    guardian: {
      name: 'Tariq Al-Mansoor',
      relation: 'Father',
      phone: '+1 (555) 789-3456',
      email: 'tariq.mansoor@example.com',
      address: '190 Horizon Drive, Parkside',
      occupation: 'Biochemist',
    },
  },
  {
    id: 'std-7',
    admissionNo: 'ADM-2024-007',
    rollNumber: '11A-02',
    firstName: 'Ethan',
    lastName: 'Taylor',
    grade: 'Grade 11',
    section: 'A',
    gender: 'Male',
    dob: '2009-09-14',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    enrollmentDate: '2022-09-01',
    guardian: {
      name: 'Sarah Taylor',
      relation: 'Mother',
      phone: '+1 (555) 901-2345',
      email: 'sarah.taylor@example.com',
      address: '52 Riverside Avenue',
      occupation: 'High School Counselor',
    },
  },
  {
    id: 'std-8',
    admissionNo: 'ADM-2024-008',
    rollNumber: '12A-01',
    firstName: 'Olivia',
    lastName: 'Dubois',
    grade: 'Grade 12',
    section: 'A',
    gender: 'Female',
    dob: '2008-01-25',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'B-',
    enrollmentDate: '2021-09-01',
    guardian: {
      name: 'Henri Dubois',
      relation: 'Father',
      phone: '+1 (555) 432-1098',
      email: 'henri.dubois@example.com',
      address: '14 Vineyard Court, St. Claire',
      occupation: 'Journalist',
    },
  },
  {
    id: 'std-9',
    admissionNo: 'ADM-2024-009',
    rollNumber: '9A-01',
    firstName: 'Aiden',
    lastName: 'Kim',
    grade: 'Grade 9',
    section: 'A',
    gender: 'Male',
    dob: '2011-05-18',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'A+',
    enrollmentDate: '2024-09-01',
    guardian: {
      name: 'Grace Kim',
      relation: 'Mother',
      phone: '+1 (555) 654-3210',
      email: 'grace.kim@example.com',
      address: '77 Magnolia Street',
      occupation: 'Graphic Designer',
    },
  },
  {
    id: 'std-10',
    admissionNo: 'ADM-2024-010',
    rollNumber: '9A-02',
    firstName: 'Chloe',
    lastName: 'Johnson',
    grade: 'Grade 9',
    section: 'A',
    gender: 'Female',
    dob: '2011-10-09',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bloodGroup: 'O+',
    enrollmentDate: '2024-09-01',
    guardian: {
      name: 'Robert Johnson',
      relation: 'Father',
      phone: '+1 (555) 890-1234',
      email: 'robert.johnson@example.com',
      address: '204 Pinecone Lane',
      occupation: 'Attorney',
    },
  },
];

export const INITIAL_ACADEMIC_RECORDS: StudentAcademicRecord[] = [
  {
    studentId: 'std-1',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.82,
    rank: 2,
    totalStudentsInClass: 28,
    attendancePercentage: 96.5,
    conductRemarks: 'Exemplary conduct. Liam displays genuine intellectual curiosity and collaborates smoothly in peer group activities.',
    principalRemarks: 'Strong academic performance across all disciplines. Keep up this momentum for the upcoming state science showcase.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Advanced Mathematics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 18, test2: 19, midterm: 28, finalExam: 27, assignment: 9 },
        totalScore: 92,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Exceptional mastery in polynomial algebra and analytic trigonometry.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Integrated Physics & Chemistry',
        teacherName: 'Prof. Clara Higgins',
        credits: 4,
        scores: { test1: 17, test2: 18, midterm: 26, finalExam: 28, assignment: 8 },
        totalScore: 89,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Meticulous laboratory technique and insightful lab reports.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'English Literature & Rhetoric',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 16, test2: 17, midterm: 25, finalExam: 26, assignment: 8 },
        totalScore: 84,
        letterGrade: 'B+',
        gpaPoint: 3.4,
        remarks: 'Analytical essays show depth, could be more active in group seminars.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Computer Science & Python',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 20, test2: 19, midterm: 29, finalExam: 29, assignment: 10 },
        totalScore: 97,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Outstanding algorithm design and data structures problem solving.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'World History & Civilizations',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 16, test2: 18, midterm: 24, finalExam: 25, assignment: 8 },
        totalScore: 83,
        letterGrade: 'B+',
        gpaPoint: 3.3,
        remarks: 'Good grasp of geopolitical timelines and source evaluation.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 19, test2: 18, midterm: 27, finalExam: 27, assignment: 9 },
        totalScore: 91,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Creative perspective in architectural sketches and perspective drawings.',
      },
    ],
  },
  {
    studentId: 'std-2',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.96,
    rank: 1,
    totalStudentsInClass: 28,
    attendancePercentage: 98.2,
    conductRemarks: 'Sophia is an exceptional model student, constantly demonstrating leadership, empathy, and active class participation.',
    principalRemarks: 'Top of class ranking. Nominated for the National STEM Olympiad Delegation.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Advanced Mathematics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 20, test2: 20, midterm: 29, finalExam: 30, assignment: 10 },
        totalScore: 99,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Perfect calculation accuracy and creative geometric proofs.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Integrated Physics & Chemistry',
        teacherName: 'Prof. Clara Higgins',
        credits: 4,
        scores: { test1: 19, test2: 19, midterm: 29, finalExam: 29, assignment: 9 },
        totalScore: 96,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Leader of the science club robotics sub-committee.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'English Literature & Rhetoric',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 18, test2: 19, midterm: 27, finalExam: 28, assignment: 9 },
        totalScore: 92,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Profound textual interpretation and persuasive oration skills.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Computer Science & Python',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 19, test2: 20, midterm: 28, finalExam: 30, assignment: 10 },
        totalScore: 97,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Engineered a modular web application for school club registrations.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'World History & Civilizations',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 18, test2: 18, midterm: 26, finalExam: 27, assignment: 9 },
        totalScore: 89,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Strong comparative synthesis of Renaissance cultural movements.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 18, test2: 18, midterm: 26, finalExam: 27, assignment: 9 },
        totalScore: 90,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Expressive watercolor studies.',
      },
    ],
  },
  {
    studentId: 'std-3',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.12,
    rank: 14,
    totalStudentsInClass: 28,
    attendancePercentage: 81.4,
    conductRemarks: 'Noah is polite and capable but has suffered several absences due to health flare-ups, affecting assignment completion.',
    principalRemarks: 'Requires dedicated remedial support in Physics and consistent homework submissions.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Advanced Mathematics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 14, test2: 15, midterm: 22, finalExam: 23, assignment: 7 },
        totalScore: 74,
        letterGrade: 'C+',
        gpaPoint: 2.7,
        remarks: 'Needs additional practice with quadratic functions and graphing.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Integrated Physics & Chemistry',
        teacherName: 'Prof. Clara Higgins',
        credits: 4,
        scores: { test1: 13, test2: 14, midterm: 20, finalExam: 21, assignment: 6 },
        totalScore: 68,
        letterGrade: 'C',
        gpaPoint: 2.3,
        remarks: 'Struggles with dimensional analysis; tutorial attendance recommended.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'English Literature & Rhetoric',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 16, test2: 16, midterm: 24, finalExam: 24, assignment: 8 },
        totalScore: 80,
        letterGrade: 'B',
        gpaPoint: 3.0,
        remarks: 'Thoughtful reader with good conversational inputs.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Computer Science & Python',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 18, test2: 18, midterm: 27, finalExam: 28, assignment: 9 },
        totalScore: 90,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Very passionate about game scripting and Pygame modules.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'World History & Civilizations',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 15, test2: 15, midterm: 22, finalExam: 23, assignment: 7 },
        totalScore: 75,
        letterGrade: 'C+',
        gpaPoint: 2.7,
        remarks: 'Improvement noted in essay structuring.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 17, test2: 17, midterm: 25, finalExam: 26, assignment: 8 },
        totalScore: 85,
        letterGrade: 'B+',
        gpaPoint: 3.4,
        remarks: 'Expressive ceramic sculpture work.',
      },
    ],
  },
  {
    studentId: 'std-4',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.65,
    rank: 6,
    totalStudentsInClass: 28,
    attendancePercentage: 94.0,
    conductRemarks: 'Pleasant, inquisitive, and diligent with all coursework obligations.',
    principalRemarks: 'Solid term outcome. Recommended for honors seminar in literature.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Advanced Mathematics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 16, test2: 17, midterm: 25, finalExam: 26, assignment: 8 },
        totalScore: 84,
        letterGrade: 'B+',
        gpaPoint: 3.4,
        remarks: 'Strong foundation in coordinate systems.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Integrated Physics & Chemistry',
        teacherName: 'Prof. Clara Higgins',
        credits: 4,
        scores: { test1: 18, test2: 18, midterm: 27, finalExam: 27, assignment: 9 },
        totalScore: 90,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Clear scientific curiosity in thermo-dynamics.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'English Literature & Rhetoric',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 19, test2: 19, midterm: 28, finalExam: 29, assignment: 9 },
        totalScore: 95,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Exceptional literary analysis; published in the school literary journal.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Computer Science & Python',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 16, test2: 17, midterm: 24, finalExam: 25, assignment: 8 },
        totalScore: 82,
        letterGrade: 'B+',
        gpaPoint: 3.3,
        remarks: 'Solid problem solving in loops and arrays.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'World History & Civilizations',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 17, test2: 18, midterm: 26, finalExam: 26, assignment: 8 },
        totalScore: 87,
        letterGrade: 'A',
        gpaPoint: 3.7,
        remarks: 'Great depth in term documentary presentation.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 18, test2: 18, midterm: 27, finalExam: 28, assignment: 9 },
        totalScore: 91,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Talented digital illustration series.',
      },
    ],
  },
  {
    studentId: 'std-5',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.42,
    rank: 9,
    totalStudentsInClass: 26,
    attendancePercentage: 91.0,
    conductRemarks: 'Energetic and participative; maintains good sportsmanship on school teams.',
    principalRemarks: 'Steady progress maintained this semester.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Advanced Mathematics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 15, test2: 16, midterm: 24, finalExam: 24, assignment: 8 },
        totalScore: 81,
        letterGrade: 'B',
        gpaPoint: 3.1,
        remarks: 'Good understanding of trigonometry basics.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Integrated Physics & Chemistry',
        teacherName: 'Prof. Clara Higgins',
        credits: 4,
        scores: { test1: 17, test2: 17, midterm: 26, finalExam: 25, assignment: 8 },
        totalScore: 85,
        letterGrade: 'B+',
        gpaPoint: 3.4,
        remarks: 'Good teamwork during chemistry titrations.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'English Literature & Rhetoric',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 16, test2: 16, midterm: 24, finalExam: 25, assignment: 8 },
        totalScore: 81,
        letterGrade: 'B',
        gpaPoint: 3.0,
        remarks: 'Speaks clearly during presentations.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Computer Science & Python',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 18, test2: 18, midterm: 26, finalExam: 27, assignment: 8 },
        totalScore: 88,
        letterGrade: 'A',
        gpaPoint: 3.7,
        remarks: 'Built a practical inventory database script.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'World History & Civilizations',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 15, test2: 16, midterm: 23, finalExam: 24, assignment: 8 },
        totalScore: 78,
        letterGrade: 'C+',
        gpaPoint: 2.8,
        remarks: 'Needs deeper primary source referencing.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 17, test2: 17, midterm: 25, finalExam: 26, assignment: 8 },
        totalScore: 84,
        letterGrade: 'B+',
        gpaPoint: 3.4,
        remarks: 'Good eye for photographic composition.',
      },
    ],
  },
  {
    studentId: 'std-6',
    term: 'Term 2',
    academicYear: '2025/2026',
    overallGpa: 3.91,
    rank: 1,
    totalStudentsInClass: 25,
    attendancePercentage: 97.8,
    conductRemarks: 'Extremely focused, respectful, and a natural mentor to junior students.',
    principalRemarks: 'Honors list standing; excellent scientific research submission.',
    subjects: [
      {
        subjectId: 'sub-math',
        subjectName: 'Calculus & Statistics',
        teacherName: 'Dr. Gregory Vance',
        credits: 4,
        scores: { test1: 19, test2: 19, midterm: 28, finalExam: 29, assignment: 10 },
        totalScore: 95,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Flawless execution of integration by parts.',
      },
      {
        subjectId: 'sub-sci',
        subjectName: 'Advanced AP Biology',
        teacherName: 'Dr. Evelyn Sanders',
        credits: 4,
        scores: { test1: 19, test2: 20, midterm: 29, finalExam: 29, assignment: 10 },
        totalScore: 97,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'Published CRISPR gene-editing survey in student review.',
      },
      {
        subjectId: 'sub-eng',
        subjectName: 'AP English Language',
        teacherName: 'Ms. Rebecca Sterling',
        credits: 3,
        scores: { test1: 18, test2: 18, midterm: 26, finalExam: 27, assignment: 9 },
        totalScore: 89,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Insightful rhetorical analyses of contemporary essays.',
      },
      {
        subjectId: 'sub-cs',
        subjectName: 'Data Structures & Algorithms',
        teacherName: 'Mr. Alex Zhou',
        credits: 3,
        scores: { test1: 19, test2: 19, midterm: 28, finalExam: 29, assignment: 9 },
        totalScore: 94,
        letterGrade: 'A+',
        gpaPoint: 4.0,
        remarks: 'High efficiency in dynamic programming problems.',
      },
      {
        subjectId: 'sub-his',
        subjectName: 'AP European History',
        teacherName: 'Mr. Ronald Keller',
        credits: 3,
        scores: { test1: 17, test2: 18, midterm: 26, finalExam: 27, assignment: 9 },
        totalScore: 88,
        letterGrade: 'A',
        gpaPoint: 3.7,
        remarks: 'Thorough thesis defenses during historical debates.',
      },
      {
        subjectId: 'sub-art',
        subjectName: 'Studio Art & Media',
        teacherName: 'Mrs. Cynthia Cruz',
        credits: 2,
        scores: { test1: 18, test2: 19, midterm: 27, finalExam: 27, assignment: 9 },
        totalScore: 91,
        letterGrade: 'A',
        gpaPoint: 3.8,
        remarks: 'Excellent printmaking project.',
      },
    ],
  },
];

// Generate attendance records for past 10 days
export function generateInitialAttendance(): DailyAttendanceEntry[] {
  const dates = [
    '2026-09-01',
    '2026-09-02',
    '2026-09-03',
    '2026-09-04',
    '2026-09-05',
    '2026-09-08',
    '2026-09-09',
    '2026-09-10', // Today
  ];

  const entries: DailyAttendanceEntry[] = [];

  dates.forEach((date) => {
    INITIAL_STUDENTS.forEach((student) => {
      let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
      let notes: string | undefined = undefined;
      let whereabouts: string | undefined = 'On Campus / Classroom (Present & Safe)';
      let emergencyNotes: string | undefined = undefined;
      let reportedBy: string | undefined = 'Class Teacher (Morning Roll Call)';
      let timeIn: string | undefined = '07:55 AM';

      // Realistic variation
      if (student.id === 'std-3') {
        // Noah Patel has some absences
        if (date === '2026-09-04') {
          status = 'absent';
          notes = 'Medical illness (Severe Flu)';
          whereabouts = 'Home (Bed rest - Parent confirmed)';
          emergencyNotes = 'Parent Grace Patel at home; reachable at +1 (555) 345-6789';
          reportedBy = 'Parent Phone Call (07:15 AM)';
          timeIn = undefined;
        } else if (date === '2026-09-08') {
          status = 'absent';
          notes = 'Medical appointment (Pediatric Follow-up)';
          whereabouts = 'Avenue Healthcare Clinic / Doctor Consultation';
          emergencyNotes = 'Medical note submitted to school office';
          reportedBy = 'Parent Email';
          timeIn = undefined;
        } else if (date === '2026-09-02') {
          status = 'late';
          notes = 'Traffic delay on highway 101';
          whereabouts = 'Arrived at Classroom via North Gate';
          emergencyNotes = 'Safely accounted for in classroom';
          reportedBy = 'Gate Security Desk';
          timeIn = '08:24 AM';
        }
      } else if (student.id === 'std-2') {
        if (date === '2026-09-05') {
          status = 'late';
          notes = 'Vehicle puncture on commute';
          whereabouts = 'Arrived at Main Building (15 min tardy)';
          emergencyNotes = 'Safely in attendance';
          reportedBy = 'Parent Sarah Wilson';
          timeIn = '08:15 AM';
        }
      } else if (student.id === 'std-4') {
        if (date === '2026-09-09') {
          status = 'absent';
          notes = 'Mild fever and rest';
          whereabouts = 'Home (Recovering at residential address)';
          emergencyNotes = 'Guardian David Taylor reachable at +1 (555) 456-7890';
          reportedBy = 'Parent SMS';
          timeIn = undefined;
        }
      } else if (student.id === 'std-5') {
        if (date === '2026-09-03') {
          status = 'late';
          notes = 'Dental surgery follow-up';
          whereabouts = 'Arrived from Dental Clinic with excuse slip';
          emergencyNotes = 'Student cleared to resume afternoon classes';
          reportedBy = 'Clinic Excuse Slip';
          timeIn = '08:40 AM';
        }
      } else if (student.id === 'std-7') {
        if (date === '2026-09-09') {
          status = 'excused';
          notes = 'Regional varsity soccer tournament';
          whereabouts = 'Kasarani Stadium with School Athletics Team';
          emergencyNotes = 'Under supervision of Coach Mwangi (+254 700 123 456)';
          reportedBy = 'Sports Directorate';
          timeIn = undefined;
        }
      } else if (student.id === 'std-8') {
        if (date === '2026-09-08') {
          status = 'absent';
          notes = 'Asthma observation / Rest';
          whereabouts = 'School Infirmary (Nurse Sick Bay)';
          emergencyNotes = 'Monitored by Nurse Wanjiku; parent notified';
          reportedBy = 'Campus Health Center';
          timeIn = undefined;
        }
      } else if (student.id === 'std-10') {
        if (date === '2026-09-10') {
          status = 'late';
          notes = 'Bus line 4 mechanical fault';
          whereabouts = 'Arrived via School Relief Bus #12';
          emergencyNotes = 'All passengers accounted for safely';
          reportedBy = 'School Transport Dispatch';
          timeIn = '08:18 AM';
        }
      }

      if (status === 'present') {
        whereabouts = 'On Campus / Classroom (Present & Safe)';
        timeIn = timeIn || '07:55 AM';
      }

      entries.push({
        id: `att-${student.id}-${date}`,
        studentId: student.id,
        date,
        status,
        notes,
        whereabouts,
        emergencyNotes,
        reportedBy,
        timeIn: status === 'present' ? timeIn : (status === 'late' ? timeIn : undefined),
      });
    });
  });

  return entries;
}

export const INITIAL_FEE_INVOICES: FeeInvoice[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-2025-0891',
    studentId: 'std-1', // Liam Davis
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-15',
    totalAmount: 48500,
    paidAmount: 48500,
    balance: 0,
    status: 'paid',
    items: [
      { id: 'item-1', description: 'Term 2 Tuition & Faculty Instruction', amount: 36000, category: 'Tuition' },
      { id: 'item-2', description: 'Physics & Computer Science Lab Access', amount: 6500, category: 'Laboratory' },
      { id: 'item-3', description: 'Annual Library & Digital Portal License', amount: 3000, category: 'Annual Package' },
      { id: 'item-4', description: 'Athletics & Sports Club Equipment', amount: 3000, category: 'Extracurricular' },
    ],
    paymentHistory: [
      {
        id: 'pay-101',
        receiptNo: 'REC-2025-4421',
        amount: 48500,
        date: '2026-08-28',
        paymentMethod: 'Mobile Money',
        payerAccount: 'M-Pesa (0712 345 678)',
        payerName: 'Sarah Davis',
        notes: 'Full payment cleared via M-Pesa Paybill #247247',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-2025-0892',
    studentId: 'std-2', // Sophia Chen
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-15',
    totalAmount: 54000,
    paidAmount: 54000,
    balance: 0,
    status: 'paid',
    items: [
      { id: 'item-5', description: 'Term 2 Tuition & Faculty Instruction', amount: 36000, category: 'Tuition' },
      { id: 'item-6', description: 'Physics & STEM Robotics Lab Kit', amount: 9000, category: 'Laboratory' },
      { id: 'item-7', description: 'School Transit Service (North Route)', amount: 6000, category: 'Transport' },
      { id: 'item-8', description: 'Annual Library & Digital Resources', amount: 3000, category: 'Annual Package' },
    ],
    paymentHistory: [
      {
        id: 'pay-102',
        receiptNo: 'REC-2025-4430',
        amount: 54000,
        date: '2026-08-20',
        paymentMethod: 'Bank Transfer',
        payerAccount: 'Equity Bank A/C 011029384756',
        payerName: 'Marcus Chen',
        notes: 'Direct bank transfer from Marcus Chen (Equity Bank)',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-2025-0893',
    studentId: 'std-3', // Noah Patel
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-01',
    totalAmount: 45000,
    paidAmount: 20000,
    balance: 25000,
    status: 'overdue',
    items: [
      { id: 'item-9', description: 'Term 2 Tuition & Academic Support', amount: 36000, category: 'Tuition' },
      { id: 'item-10', description: 'Computer Lab Access & Cloud Environment', amount: 6000, category: 'Laboratory' },
      { id: 'item-11', description: 'Student Health & Wellness Fee', amount: 3000, category: 'Annual Package' },
    ],
    paymentHistory: [
      {
        id: 'pay-103',
        receiptNo: 'REC-2025-4491',
        amount: 20000,
        date: '2026-08-30',
        paymentMethod: 'Mobile Money',
        payerAccount: 'M-Pesa (0722 890 123)',
        payerName: 'Priya Patel',
        notes: 'Partial payment installment 1 of 2 via M-Pesa',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-2025-0894',
    studentId: 'std-4', // Emma Wilson
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-15',
    totalAmount: 46000,
    paidAmount: 23000,
    balance: 23000,
    status: 'partial',
    items: [
      { id: 'item-12', description: 'Term 2 Tuition & Faculty Instruction', amount: 36000, category: 'Tuition' },
      { id: 'item-13', description: 'Fine Arts Studio Supplies & Materials', amount: 5000, category: 'Extracurricular' },
      { id: 'item-14', description: 'Digital Library & Research License', amount: 5000, category: 'Annual Package' },
    ],
    paymentHistory: [
      {
        id: 'pay-104',
        receiptNo: 'REC-2025-4512',
        amount: 23000,
        date: '2026-09-02',
        paymentMethod: 'Bank Transfer',
        payerAccount: 'KCB Bank A/C 1122334455',
        payerName: 'David Wilson',
        notes: 'Mid-term split payment received (KCB Bank)',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
  {
    id: 'inv-5',
    invoiceNo: 'INV-2025-0895',
    studentId: 'std-5', // Lucas Ramirez
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-20',
    totalAmount: 42000,
    paidAmount: 0,
    balance: 42000,
    status: 'pending',
    items: [
      { id: 'item-15', description: 'Term 2 Tuition & Instruction', amount: 35000, category: 'Tuition' },
      { id: 'item-16', description: 'Science Laboratory Materials', amount: 4000, category: 'Laboratory' },
      { id: 'item-17', description: 'Athletics & Physical Ed Fee', amount: 3000, category: 'Extracurricular' },
    ],
    paymentHistory: [],
  },
  {
    id: 'inv-6',
    invoiceNo: 'INV-2025-0896',
    studentId: 'std-6', // Maya Al-Mansoor
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-15',
    totalAmount: 58000,
    paidAmount: 58000,
    balance: 0,
    status: 'paid',
    items: [
      { id: 'item-18', description: 'Term 2 Advanced Placement Tuition', amount: 42000, category: 'Tuition' },
      { id: 'item-19', description: 'AP Biology & Genetics Lab Kit', amount: 8000, category: 'Laboratory' },
      { id: 'item-20', description: 'National KNEC/Exam Board Registration', amount: 5000, category: 'Examination' },
      { id: 'item-21', description: 'Digital Library & Research License', amount: 3000, category: 'Annual Package' },
    ],
    paymentHistory: [
      {
        id: 'pay-105',
        receiptNo: 'REC-2025-4390',
        amount: 58000,
        date: '2026-08-18',
        paymentMethod: 'Mobile Money',
        payerAccount: 'M-Pesa (0733 456 789)',
        payerName: 'Fatima Al-Mansoor',
        notes: 'Paid in full prior to term start via M-Pesa',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
  {
    id: 'inv-7',
    invoiceNo: 'INV-2025-0897',
    studentId: 'std-7', // Ethan Taylor
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-05',
    totalAmount: 47500,
    paidAmount: 0,
    balance: 47500,
    status: 'overdue',
    items: [
      { id: 'item-22', description: 'Term 2 Tuition & Instruction', amount: 38000, category: 'Tuition' },
      { id: 'item-23', description: 'Varsity Soccer Team Travel & Kit', amount: 6500, category: 'Extracurricular' },
      { id: 'item-24', description: 'Student Health & Accident Cover', amount: 3000, category: 'Annual Package' },
    ],
    paymentHistory: [],
  },
  {
    id: 'inv-8',
    invoiceNo: 'INV-2025-0898',
    studentId: 'std-8', // Olivia Dubois
    term: 'Term 2',
    academicYear: '2025/2026',
    issuedDate: '2026-08-15',
    dueDate: '2026-09-15',
    totalAmount: 62000,
    paidAmount: 62000,
    balance: 0,
    status: 'paid',
    items: [
      { id: 'item-25', description: 'Senior Year Honors Tuition', amount: 45000, category: 'Tuition' },
      { id: 'item-26', description: 'Senior Capstone & Graduation Regalia Fund', amount: 9000, category: 'Annual Package' },
      { id: 'item-27', description: 'College Counseling & KCSE Prep Suite', amount: 8000, category: 'Examination' },
    ],
    paymentHistory: [
      {
        id: 'pay-106',
        receiptNo: 'REC-2025-4402',
        amount: 62000,
        date: '2026-08-22',
        paymentMethod: 'Bank Transfer',
        payerAccount: 'Co-operative Bank A/C 0112984712',
        payerName: 'Henri Dubois',
        notes: 'Full payment from Henri Dubois (Co-operative Bank)',
        recordedBy: 'Finance Office (M. Harper)',
      },
    ],
  },
];

export const INITIAL_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 'thread-std-1',
    studentId: 'std-1',
    studentName: 'Liam Davis',
    parentName: 'Eleanor Davis',
    parentPhone: '+1 (555) 234-8901',
    parentEmail: 'eleanor.davis@example.com',
    grade: 'Grade 10',
    lastMessage: 'Thank you for the update on Liam\'s science fair proposal. We will review it together tonight.',
    lastMessageTime: 'Today, 09:42 AM',
    unreadCountForStaff: 0,
    unreadCountForParent: 1,
    category: 'academic',
  },
  {
    id: 'thread-std-3',
    studentId: 'std-3',
    studentName: 'Noah Patel',
    parentName: 'Ananya Patel',
    parentPhone: '+1 (555) 876-5432',
    parentEmail: 'ananya.patel@example.com',
    grade: 'Grade 10',
    lastMessage: 'Regarding Noah\'s absence yesterday: the medical note from Dr. Henderson has been submitted.',
    lastMessageTime: 'Yesterday, 04:15 PM',
    unreadCountForStaff: 1,
    unreadCountForParent: 0,
    category: 'attendance',
  },
  {
    id: 'thread-std-4',
    studentId: 'std-4',
    studentName: 'Emma Wilson',
    parentName: 'David Wilson',
    parentPhone: '+1 (555) 345-9012',
    parentEmail: 'david.wilson@example.com',
    grade: 'Grade 10',
    lastMessage: 'We received the reminder for the Term 2 fee installment balance. Processing it this Friday.',
    lastMessageTime: 'Sep 08, 02:30 PM',
    unreadCountForStaff: 0,
    unreadCountForParent: 0,
    category: 'fees',
  },
  {
    id: 'thread-std-2',
    studentId: 'std-2',
    studentName: 'Sophia Chen',
    parentName: 'Marcus Chen',
    parentPhone: '+1 (555) 456-7812',
    parentEmail: 'marcus.chen@example.com',
    grade: 'Grade 10',
    lastMessage: 'Very pleased with Sophia\'s mid-term evaluation. Is the STEM symposium schedule finalized?',
    lastMessageTime: 'Sep 07, 11:20 AM',
    unreadCountForStaff: 0,
    unreadCountForParent: 0,
    category: 'academic',
  },
  {
    id: 'thread-std-5',
    studentId: 'std-5',
    studentName: 'Lucas Ramirez',
    parentName: 'Elena Ramirez',
    parentPhone: '+1 (555) 678-1234',
    parentEmail: 'elena.ramirez@example.com',
    grade: 'Grade 10',
    lastMessage: 'Confirming Lucas has a dental appointment tomorrow morning, will arrive by 09:30 AM.',
    lastMessageTime: 'Sep 06, 03:45 PM',
    unreadCountForStaff: 0,
    unreadCountForParent: 0,
    category: 'attendance',
  },
];

export const INITIAL_DIRECT_MESSAGES: DirectMessage[] = [
  // Thread 1: Liam Davis
  {
    id: 'msg-101',
    threadId: 'thread-std-1',
    studentId: 'std-1',
    senderRole: 'teacher',
    senderName: 'Dr. Gregory Vance (Math & Class Advisor)',
    content: 'Good morning Mrs. Davis. I wanted to commend Liam for his outstanding presentation in advanced algebra today. He assisted two classmates with geometric proofs during group work.',
    timestamp: '2026-09-09T08:30:00Z',
    isRead: true,
    category: 'academic',
  },
  {
    id: 'msg-102',
    threadId: 'thread-std-1',
    studentId: 'std-1',
    senderRole: 'parent',
    senderName: 'Eleanor Davis',
    content: 'Good morning Dr. Vance! That is wonderful to hear. He has been putting in dedicated hours on the extra challenge problem sets.',
    timestamp: '2026-09-09T09:12:00Z',
    isRead: true,
    category: 'academic',
  },
  {
    id: 'msg-103',
    threadId: 'thread-std-1',
    studentId: 'std-1',
    senderRole: 'school_admin',
    senderName: 'Prof. Clara Higgins (Science Dept)',
    content: 'Hello Mrs. Davis, just a gentle reminder that Liam\'s topic proposal for the Regional Science Fair is due next Monday. He has chosen renewable hydrogen fuel cells which looks very promising!',
    timestamp: '2026-09-10T08:15:00Z',
    isRead: true,
    category: 'academic',
  },
  {
    id: 'msg-104',
    threadId: 'thread-std-1',
    studentId: 'std-1',
    senderRole: 'parent',
    senderName: 'Eleanor Davis',
    content: 'Thank you for the update on Liam\'s science fair proposal. We will review it together tonight.',
    timestamp: '2026-09-10T09:42:00Z',
    isRead: true,
    category: 'academic',
  },

  // Thread 3: Noah Patel
  {
    id: 'msg-301',
    threadId: 'thread-std-3',
    studentId: 'std-3',
    senderRole: 'school_admin',
    senderName: 'School Attendance Office',
    content: 'Notice of Absence: Noah Patel was marked absent today (September 8, 2026) for morning roll call. Please confirm or provide doctor justification for records.',
    timestamp: '2026-09-08T09:05:00Z',
    isRead: true,
    category: 'attendance',
  },
  {
    id: 'msg-302',
    threadId: 'thread-std-3',
    studentId: 'std-3',
    senderRole: 'parent',
    senderName: 'Ananya Patel',
    content: 'Regarding Noah\'s absence yesterday: the medical note from Dr. Henderson has been submitted.',
    timestamp: '2026-09-09T16:15:00Z',
    isRead: false,
    category: 'attendance',
  },

  // Thread 4: Emma Wilson
  {
    id: 'msg-401',
    threadId: 'thread-std-4',
    studentId: 'std-4',
    senderRole: 'school_admin',
    senderName: 'Accounts & Bursar Office',
    content: 'Fee Statement Reminder: A reminder that the second installment of Term 2 fees ($900.00) for Emma Wilson is due on September 15, 2026. Online payment is available via the portal.',
    timestamp: '2026-09-08T11:00:00Z',
    isRead: true,
    category: 'fees',
  },
  {
    id: 'msg-402',
    threadId: 'thread-std-4',
    studentId: 'std-4',
    senderRole: 'parent',
    senderName: 'David Wilson',
    content: 'We received the reminder for the Term 2 fee installment balance. Processing it this Friday.',
    timestamp: '2026-09-08T14:30:00Z',
    isRead: true,
    category: 'fees',
  },
];

export const INITIAL_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Mid-Term Examination Schedule & Revision Guidelines',
    content: 'The comprehensive Mid-Term examinations for Grades 9 through 12 will commence on Monday, October 13th. Detailed subject timetables, classroom allocations, and revision materials have been uploaded to the student study repository. Daily dismissal will be at 1:30 PM during exam week.',
    author: 'Academic Dean Dr. Aris Vance',
    authorRole: 'Academic Dean',
    date: '2026-09-08',
    targetAudience: 'All Parents & Students',
    priority: 'important',
    tag: 'Academic',
    readByCount: 142,
  },
  {
    id: 'ann-2',
    title: 'Upcoming Parent-Teacher Conference (Term 2)',
    content: 'We warmly invite all parents and guardians to our Term 2 In-Person Parent-Teacher Conference scheduled for Friday, September 25th, from 8:30 AM to 4:00 PM. Individual 15-minute appointment slots with subject instructors will open for online booking this Wednesday at 6:00 PM.',
    author: 'Principal Margaret Hastings',
    authorRole: 'Head of School',
    date: '2026-09-06',
    targetAudience: 'All Parents & Students',
    priority: 'important',
    tag: 'Community',
    readByCount: 189,
  },
  {
    id: 'ann-3',
    title: 'Annual STEM & Innovation Showcase 2026 Registration',
    content: 'Students from Grades 10 and 11 are invited to register their science, robotics, and coding projects for our Annual Innovation Showcase. Project submissions close on September 22nd. Top projects will represent the institution at the Regional State Olympiad with full sponsorship.',
    author: 'Prof. Clara Higgins',
    authorRole: 'STEM Coordinator',
    date: '2026-09-04',
    targetAudience: 'Grade 10',
    priority: 'normal',
    tag: 'Extracurricular',
    readByCount: 94,
  },
  {
    id: 'ann-4',
    title: 'Term 2 Fee Payment Deadline & Account Reconciliation',
    content: 'Parents are respectfully reminded that the standard due date for Term 2 tuition balances is September 15, 2026. For questions regarding flexible payment schedules or bursary adjustments, please contact the accounts desk directly through the portal messaging tab.',
    author: 'Finance & Bursary Directorate',
    authorRole: 'Bursar',
    date: '2026-09-01',
    targetAudience: 'All Parents & Students',
    priority: 'urgent',
    tag: 'Finance',
    readByCount: 215,
  },
];
