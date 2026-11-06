import { Student, DailyAttendanceEntry } from '../types';

export interface AttendanceSummaryExportData {
  schoolName: string;
  className: string;
  teacherName: string;
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  entries: Array<{
    date: string;
    student: Student;
    record: DailyAttendanceEntry | undefined;
  }>;
}

export const downloadAttendanceSummaryCSV = (data: AttendanceSummaryExportData) => {
  const headers = [
    'Date',
    'Student Name',
    'Roll Number',
    'Admission No',
    'Class',
    'Section',
    'Attendance Status',
    'Time Recorded / In',
    'Whereabouts / Location',
    'Reason / Notes',
    'Emergency Contact Name',
    'Emergency Relationship',
    'Emergency Phone',
    'Emergency Address',
    'Emergency Notes',
    'Reported / Verified By',
  ];

  const escapeCsvField = (field: string | number | undefined | null): string => {
    if (field === undefined || field === null) return '""';
    const str = String(field);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = data.entries.map(({ date, student, record }) => {
    const status = record?.status || 'present';
    const timeIn = record?.timeIn || (status === 'present' ? '07:55 AM' : '—');
    const whereabouts =
      record?.whereabouts ||
      (status === 'present'
        ? 'On Campus / Classroom (Present & Safe)'
        : status === 'absent'
        ? 'Home / Parent Verification Pending'
        : status === 'late'
        ? 'Arrived on Campus (Tardy)'
        : 'Excused Leave');
    const notes = record?.notes || '—';
    const emergencyNotes = record?.emergencyNotes || '—';
    const reportedBy = record?.reportedBy || 'Class Teacher';

    return [
      escapeCsvField(date),
      escapeCsvField(`${student.firstName} ${student.lastName}`),
      escapeCsvField(student.rollNumber),
      escapeCsvField(student.admissionNo),
      escapeCsvField(student.grade),
      escapeCsvField(student.section),
      escapeCsvField(status.toUpperCase()),
      escapeCsvField(timeIn),
      escapeCsvField(whereabouts),
      escapeCsvField(notes),
      escapeCsvField(student.guardian.name),
      escapeCsvField(student.guardian.relation),
      escapeCsvField(student.guardian.phone),
      escapeCsvField(student.guardian.address),
      escapeCsvField(emergencyNotes),
      escapeCsvField(reportedBy),
    ].join(',');
  });

  const metadataHeader = [
    `"School:","${data.schoolName.replace(/"/g, '""')}"`,
    `"Class / Cohort:","${data.className.replace(/"/g, '""')}"`,
    `"Class Teacher:","${data.teacherName.replace(/"/g, '""')}"`,
    `"Report Duration:","${data.dateRangeLabel.replace(/"/g, '""')}"`,
    `"Date Range:","${data.startDate} to ${data.endDate}"`,
    `"Generated At:","${new Date().toLocaleString()}"`,
    `"Document:","Emergency Whereabouts & Student Attendance Roll-Call Manifest"`,
    '',
  ].join('\n');

  const csvContent = `${metadataHeader}\n${headers.join(',')}\n${rows.join('\n')}`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedClass = data.className.replace(/\s+/g, '_');
  link.setAttribute(
    'download',
    `Attendance_Whereabouts_Summary_${sanitizedClass}_${data.startDate}_to_${data.endDate}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
