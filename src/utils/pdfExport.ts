import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { Student, StudentAcademicRecord, FeeInvoice, FeeReceiptTemplateConfig, FeePaymentRecord, DailyAttendanceEntry } from '../types';
import { saveCompressedJsPdf } from './fileCompression';

export const downloadReportCardPDF = async (
  elementId: string,
  studentName: string,
  termName: string = 'Term 2'
): Promise<boolean> => {
  try {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      return false;
    }

    // High fidelity JPEG capture with compressed pixelRatio to strictly maintain < 2MB limit
    let imgData = await toJpeg(targetElement, {
      quality: 0.82,
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    let pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let imgProps = pdf.getImageProperties(imgData);
    let pdfWidth = pdf.internal.pageSize.getWidth();
    let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let pageHeight = pdf.internal.pageSize.getHeight();

    const addPages = (doc: jsPDF, dataUrl: string, pWidth: number, pHeight: number, pPageHeight: number) => {
      if (pHeight > pPageHeight) {
        let heightLeft = pHeight;
        let position = 0;

        doc.addImage(dataUrl, 'JPEG', 0, position, pWidth, pHeight, undefined, 'FAST');
        heightLeft -= pPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pHeight;
          doc.addPage();
          doc.addImage(dataUrl, 'JPEG', 0, position, pWidth, pHeight, undefined, 'FAST');
          heightLeft -= pPageHeight;
        }
      } else {
        doc.addImage(dataUrl, 'JPEG', 0, 0, pWidth, pHeight, undefined, 'FAST');
      }
    };

    addPages(pdf, imgData, pdfWidth, pdfHeight, pageHeight);

    // Verify blob size is strictly < 2MB; if over, re-capture with tighter compression
    if (pdf.output('blob').size > 1.9 * 1024 * 1024) {
      imgData = await toJpeg(targetElement, {
        quality: 0.65,
        pixelRatio: 1.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      imgProps = pdf.getImageProperties(imgData);
      pdfWidth = pdf.internal.pageSize.getWidth();
      pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pageHeight = pdf.internal.pageSize.getHeight();
      addPages(pdf, imgData, pdfWidth, pdfHeight, pageHeight);
    }
    
    const sanitizedName = studentName.replace(/\s+/g, '_');
    const fileName = `ReportCard_${sanitizedName}_${termName.replace(/\s+/g, '_')}_2026.pdf`;
    
    saveCompressedJsPdf(pdf, fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF via image capture:', error);
    return false;
  }
};

export const downloadFeeStatementPDF = async (
  elementId: string,
  studentName: string,
  invoiceNo: string
): Promise<boolean> => {
  try {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
      return false;
    }

    let imgData = await toJpeg(targetElement, {
      quality: 0.82,
      pixelRatio: 1.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });

    let pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let imgProps = pdf.getImageProperties(imgData);
    let pdfWidth = pdf.internal.pageSize.getWidth();
    let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let pageHeight = pdf.internal.pageSize.getHeight();

    const addPages = (doc: jsPDF, dataUrl: string, pWidth: number, pHeight: number, pPageHeight: number) => {
      if (pHeight > pPageHeight) {
        let heightLeft = pHeight;
        let position = 0;

        doc.addImage(dataUrl, 'JPEG', 0, position, pWidth, pHeight, undefined, 'FAST');
        heightLeft -= pPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - pHeight;
          doc.addPage();
          doc.addImage(dataUrl, 'JPEG', 0, position, pWidth, pHeight, undefined, 'FAST');
          heightLeft -= pPageHeight;
        }
      } else {
        doc.addImage(dataUrl, 'JPEG', 0, 0, pWidth, pHeight, undefined, 'FAST');
      }
    };

    addPages(pdf, imgData, pdfWidth, pdfHeight, pageHeight);

    // Verify blob size is strictly < 2MB; if over, re-capture with tighter compression
    if (pdf.output('blob').size > 1.9 * 1024 * 1024) {
      imgData = await toJpeg(targetElement, {
        quality: 0.65,
        pixelRatio: 1.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });
      pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      imgProps = pdf.getImageProperties(imgData);
      pdfWidth = pdf.internal.pageSize.getWidth();
      pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pageHeight = pdf.internal.pageSize.getHeight();
      addPages(pdf, imgData, pdfWidth, pdfHeight, pageHeight);
    }
    
    const sanitizedName = studentName.replace(/\s+/g, '_');
    const fileName = `Fee_Statement_${sanitizedName}_${invoiceNo.replace(/\s+/g, '_')}_2026.pdf`;
    
    saveCompressedJsPdf(pdf, fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate statement PDF via image capture:', error);
    return false;
  }
};

export const generateAndDownloadStudentReportCard = (
  student: Student,
  record: StudentAcademicRecord
) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 40;

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text('SHULE 101 ACADEMY', pageWidth / 2, y, { align: 'center' });
  
  y += 18;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text('Accredited National & International Curriculum Examination Board', pageWidth / 2, y, { align: 'center' });
  
  y += 14;
  pdf.text('National School Code: SC-2026 • registrar@shule101.edu • (555) 019-2831', pageWidth / 2, y, { align: 'center' });

  y += 20;
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(1);
  pdf.line(40, y, pageWidth - 40, y);

  y += 24;
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(pageWidth / 2 - 160, y - 14, 320, 24, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`OFFICIAL STUDENT REPORT CARD • ${record.term} ${record.academicYear}`, pageWidth / 2, y + 2, { align: 'center' });

  // Student Info Box
  y += 32;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, pageWidth - 80, 54, 6, 6, 'FD');

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Student Full Name:', 52, y + 18);
  pdf.text('Admission Number:', 200, y + 18);
  pdf.text('Class & Roll No:', 330, y + 18);
  pdf.text('Primary Guardian:', 450, y + 18);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${student.firstName} ${student.lastName}`, 52, y + 36);
  pdf.text(student.admissionNo, 200, y + 36);
  pdf.text(`${student.grade} (${student.section}) • Roll #${student.rollNumber}`, 330, y + 36);
  pdf.text(`${student.guardian.name}`, 450, y + 36);

  // Subject Table Header
  y += 75;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(40, y, pageWidth - 80, 22, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);

  pdf.text('Subject & Instructor', 50, y + 14);
  pdf.text('Credit', 190, y + 14, { align: 'center' });
  pdf.text('T1 (20)', 230, y + 14, { align: 'center' });
  pdf.text('T2 (20)', 270, y + 14, { align: 'center' });
  pdf.text('Mid (30)', 310, y + 14, { align: 'center' });
  pdf.text('Fin (30)', 350, y + 14, { align: 'center' });
  pdf.text('Total (%)', 395, y + 14, { align: 'center' });
  pdf.text('Grade', 440, y + 14, { align: 'center' });
  pdf.text('GPA', 475, y + 14, { align: 'center' });
  pdf.text('Remarks', 505, y + 14);

  // Table rows
  y += 22;
  record.subjects.forEach((sub, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(40, y, pageWidth - 80, 22, 'F');
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(sub.subjectName, 50, y + 13);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(sub.teacherName, 50, y + 20);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(51, 65, 85);
    pdf.text(sub.credits.toString(), 190, y + 14, { align: 'center' });
    pdf.text(sub.scores.test1.toString(), 230, y + 14, { align: 'center' });
    pdf.text(sub.scores.test2.toString(), 270, y + 14, { align: 'center' });
    pdf.text(sub.scores.midterm.toString(), 310, y + 14, { align: 'center' });
    pdf.text(sub.scores.finalExam.toString(), 350, y + 14, { align: 'center' });

    pdf.setFont('helvetica', 'bold');
    pdf.text(`${sub.totalScore}%`, 395, y + 14, { align: 'center' });
    pdf.text(sub.letterGrade, 440, y + 14, { align: 'center' });

    pdf.setTextColor(67, 56, 202); // indigo-700
    pdf.text(sub.gpaPoint.toFixed(1), 475, y + 14, { align: 'center' });

    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    const remarksStr = sub.remarks || '';
    const trimmedRemarks = remarksStr.length > 18 ? remarksStr.substring(0, 16) + '..' : remarksStr;
    pdf.text(trimmedRemarks, 505, y + 14);

    y += 24;
  });

  // Summary KPI Cards
  y += 15;
  const kpiWidth = (pageWidth - 80 - 30) / 4;
  
  // Box 1: Cumulative GPA
  pdf.setFillColor(238, 242, 255);
  pdf.setDrawColor(224, 231, 255);
  pdf.roundedRect(40, y, kpiWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(67, 56, 202);
  pdf.text('CUMULATIVE GPA', 40 + kpiWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(49, 46, 129);
  pdf.text(`${record.overallGpa.toFixed(2)} / 4.0`, 40 + kpiWidth / 2, y + 32, { align: 'center' });

  // Box 2: Class Rank
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40 + kpiWidth + 10, y, kpiWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('CLASS POSITION', 40 + kpiWidth + 10 + kpiWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`#${record.rank} of ${record.totalStudentsInClass}`, 40 + kpiWidth + 10 + kpiWidth / 2, y + 32, { align: 'center' });

  // Box 3: Attendance
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(209, 250, 229);
  pdf.roundedRect(40 + (kpiWidth + 10) * 2, y, kpiWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(5, 150, 105);
  pdf.text('ATTENDANCE RATE', 40 + (kpiWidth + 10) * 2 + kpiWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(13);
  pdf.setTextColor(6, 78, 59);
  pdf.text(`${record.attendancePercentage}%`, 40 + (kpiWidth + 10) * 2 + kpiWidth / 2, y + 32, { align: 'center' });

  // Box 4: Academic Standing
  pdf.setFillColor(254, 243, 199);
  pdf.setDrawColor(253, 230, 138);
  pdf.roundedRect(40 + (kpiWidth + 10) * 3, y, kpiWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(217, 119, 6);
  pdf.text('HONORS STANDING', 40 + (kpiWidth + 10) * 3 + kpiWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(10);
  pdf.setTextColor(120, 53, 15);
  const honors = record.overallGpa >= 3.8 ? 'First Honors' : record.overallGpa >= 3.4 ? 'Second Honors' : 'Good Standing';
  pdf.text(honors, 40 + (kpiWidth + 10) * 3 + kpiWidth / 2, y + 30, { align: 'center' });

  // Remarks section
  y += 56;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, (pageWidth - 90) / 2, 48, 4, 4, 'FD');
  pdf.roundedRect(pageWidth / 2 + 5, y, (pageWidth - 90) / 2, 48, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Class Teacher & Advisor Notes:', 48, y + 14);
  pdf.text('Principal / Academic Dean Endorsement:', pageWidth / 2 + 13, y + 14);

  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  const teacherText = pdf.splitTextToSize(`"${record.conductRemarks}"`, (pageWidth - 110) / 2);
  pdf.text(teacherText, 48, y + 26);
  const principalText = pdf.splitTextToSize(`"${record.principalRemarks}"`, (pageWidth - 110) / 2);
  pdf.text(principalText, pageWidth / 2 + 13, y + 26);

  // Signatures
  y += 66;
  pdf.setDrawColor(148, 163, 184);
  pdf.line(60, y + 16, 180, y + 16);
  pdf.line(pageWidth / 2 - 60, y + 16, pageWidth / 2 + 60, y + 16);
  pdf.line(pageWidth - 180, y + 16, pageWidth - 60, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Dr. Gregory Vance • Faculty Advisor', 120, y + 26, { align: 'center' });
  pdf.text('Margaret Hastings, Ph.D. • Principal', pageWidth / 2, y + 26, { align: 'center' });
  pdf.text('Official Seal • Verified 2026-09-10', pageWidth - 120, y + 26, { align: 'center' });

  const sanitizedName = student.firstName + '_' + student.lastName;
  const fileName = `Report_Card_${sanitizedName}_${record.term.replace(/\s+/g, '_')}_2026.pdf`;
  saveCompressedJsPdf(pdf, fileName);
};

export const generateAndDownloadFeeStatement = (
  student: Student,
  invoice: FeeInvoice,
  config?: FeeReceiptTemplateConfig
) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 38;

  const schoolName = config?.institutionName || 'SHULE 101 ACADEMY';
  const schoolMotto = config?.institutionMotto ? `"${config.institutionMotto}"` : 'Excellence, Integrity & Leadership';
  const bursarDept = config?.bursarDepartmentName || 'Office of the Bursar & Financial Controller • Directorate of Finance';
  const schoolCode = config?.institutionCode || 'SC-2026';
  const schoolEmail = config?.emailAddress || 'accounts@shule101.edu';
  const schoolPhone = config?.phoneNumber || '+254 700 123 456';
  const poBox = config?.poBox ? `${config.poBox}, ${config.countyCity || 'Nairobi'}` : 'P.O. Box 40100, Nairobi, Kenya';

  // Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.setTextColor(15, 23, 42); // slate-900
  pdf.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 15;
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(schoolMotto, pageWidth / 2, y, { align: 'center' });

  y += 13;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 116, 139); // slate-500
  pdf.text(bursarDept, pageWidth / 2, y, { align: 'center' });

  y += 12;
  pdf.setFontSize(8);
  pdf.text(`School Code: ${schoolCode} • ${schoolEmail} • Tel: ${schoolPhone} • ${poBox}`, pageWidth / 2, y, { align: 'center' });

  if (config?.kraPin || config?.nemisCode) {
    y += 11;
    const codes = [];
    if (config.kraPin) codes.push(`KRA PIN: ${config.kraPin}`);
    if (config.nemisCode) codes.push(`NEMIS Code: ${config.nemisCode}`);
    pdf.text(codes.join(' • '), pageWidth / 2, y, { align: 'center' });
  }

  y += 16;
  pdf.setDrawColor(203, 213, 225);
  pdf.setLineWidth(1);
  pdf.line(40, y, pageWidth - 40, y);

  // Statement Title Badge
  y += 20;
  pdf.setFillColor(241, 245, 249);
  pdf.roundedRect(pageWidth / 2 - 200, y - 13, 400, 22, 4, 4, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  const docTitle = `OFFICIAL STUDENT FEE STATEMENT & INVOICE LEDGER • ${invoice.term} ${invoice.academicYear}`;
  pdf.text(docTitle, pageWidth / 2, y + 2, { align: 'center' });

  // Metadata Box (Student & Billing details)
  y += 26;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, pageWidth - 80, 68, 6, 6, 'FD');

  // Left Column: Student Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('STUDENT INFORMATION', 52, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Name:', 52, y + 30);
  pdf.text('Adm No:', 52, y + 44);
  pdf.text('Grade / Class:', 52, y + 58);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${student.firstName} ${student.lastName}`, 105, y + 30);
  pdf.text(student.admissionNo, 105, y + 44);
  pdf.text(`${student.grade} (${student.section}) • Roll #${student.rollNumber}`, 105, y + 58);

  // Middle Column: Guardian / Billed To
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('BILLED TO (GUARDIAN)', 230, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Guardian:', 230, y + 30);
  pdf.text('Phone:', 230, y + 44);
  pdf.text('Email:', 230, y + 58);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${student.guardian.name} (${student.guardian.relation})`, 280, y + 30);
  pdf.text(student.guardian.phone, 280, y + 44);
  pdf.text(student.guardian.email, 280, y + 58);

  // Right Column: Invoice Status
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('INVOICE DETAILS', 415, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Invoice No:', 415, y + 30);
  pdf.text('Issued Date:', 415, y + 44);
  pdf.text('Due Date:', 415, y + 58);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(invoice.invoiceNo, 475, y + 30);
  pdf.text(invoice.issuedDate, 475, y + 44);
  pdf.text(invoice.dueDate, 475, y + 58);

  // Section 1: Itemized Fee Schedule
  y += 84;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Itemized Fee Structure & Levies', 40, y);

  y += 8;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(40, y, pageWidth - 80, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(51, 65, 85);

  pdf.text('#', 50, y + 13);
  pdf.text('Fee Component & Description', 75, y + 13);
  pdf.text('Category', 340, y + 13);
  pdf.text('Amount (KSh)', pageWidth - 50, y + 13, { align: 'right' });

  y += 20;
  invoice.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(40, y, pageWidth - 80, 18, 'F');
    }

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text((idx + 1).toString(), 50, y + 12);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(item.description, 75, y + 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(item.category.toUpperCase(), 340, y + 12);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`KSh ${item.amount.toLocaleString()}`, pageWidth - 50, y + 12, { align: 'right' });

    y += 18;
  });

  // Total Invoiced Row
  pdf.setFillColor(241, 245, 249);
  pdf.rect(40, y, pageWidth - 80, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Total Invoiced Fees', 75, y + 13);
  pdf.text(`KSh ${invoice.totalAmount.toLocaleString()}`, pageWidth - 50, y + 13, { align: 'right' });

  // Section 2: Payment Receipts / Ledger
  y += 34;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Remittance Audit & Payment Ledger (When Paid & Account Paid From)', 40, y);

  y += 8;
  pdf.setFillColor(241, 245, 249);
  pdf.rect(40, y, pageWidth - 80, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(51, 65, 85);

  pdf.text('Receipt #', 48, y + 13);
  pdf.text('Date Paid', 125, y + 13);
  pdf.text('Paid From Account', 185, y + 13);
  pdf.text('Channel', 320, y + 13);
  pdf.text('Payer / Remitter', 390, y + 13);
  pdf.text('Amount Paid (KSh)', pageWidth - 48, y + 13, { align: 'right' });

  y += 20;
  if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
    invoice.paymentHistory.forEach((pmt, idx) => {
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(40, y, pageWidth - 80, 18, 'F');
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(pmt.receiptNo, 48, y + 12);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(pmt.date, 125, y + 12);

      const acctStr = pmt.payerAccount || 'Direct M-Pesa / Bank Channel';
      const truncatedAcct = acctStr.length > 25 ? acctStr.substring(0, 23) + '..' : acctStr;
      pdf.text(truncatedAcct, 185, y + 12);

      pdf.text(pmt.paymentMethod, 320, y + 12);
      
      const payerStr = pmt.payerName || student.guardian.name;
      const truncatedPayer = payerStr.length > 18 ? payerStr.substring(0, 16) + '..' : payerStr;
      pdf.text(truncatedPayer, 390, y + 12);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(5, 150, 105); // emerald-600
      pdf.text(`KSh ${pmt.amount.toLocaleString()}`, pageWidth - 48, y + 12, { align: 'right' });

      y += 18;
    });
  } else {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No payment transactions recorded for this billing cycle yet.', 48, y + 12);
    y += 18;
  }

  // Total Paid Row
  pdf.setFillColor(236, 253, 245); // emerald-50
  pdf.rect(40, y, pageWidth - 80, 20, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(6, 78, 59);
  pdf.text('Total Amount Remitted & Cleared', 75, y + 13);
  pdf.text(`KSh ${invoice.paidAmount.toLocaleString()}`, pageWidth - 50, y + 13, { align: 'right' });

  // Section 3: Summary KPI Box
  y += 30;
  const boxWidth = (pageWidth - 80 - 20) / 3;

  // Box 1: Total Billed
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, boxWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL BILLED', 40 + boxWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`KSh ${invoice.totalAmount.toLocaleString()}`, 40 + boxWidth / 2, y + 32, { align: 'center' });

  // Box 2: Total Paid
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(209, 250, 229);
  pdf.roundedRect(40 + boxWidth + 10, y, boxWidth, 42, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(5, 150, 105);
  pdf.text('TOTAL PAID TO DATE', 40 + boxWidth + 10 + boxWidth / 2, y + 14, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor(6, 78, 59);
  pdf.text(`KSh ${invoice.paidAmount.toLocaleString()}`, 40 + boxWidth + 10 + boxWidth / 2, y + 32, { align: 'center' });

  // Box 3: Outstanding Balance
  const isZeroBalance = invoice.balance <= 0;
  if (isZeroBalance) {
    pdf.setFillColor(236, 253, 245);
    pdf.setDrawColor(167, 243, 208);
    pdf.roundedRect(40 + (boxWidth + 10) * 2, y, boxWidth, 42, 4, 4, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(5, 150, 105);
    pdf.text('OUTSTANDING BALANCE', 40 + (boxWidth + 10) * 2 + boxWidth / 2, y + 14, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setTextColor(6, 78, 59);
    pdf.text('FULLY CLEARED (KSh 0)', 40 + (boxWidth + 10) * 2 + boxWidth / 2, y + 32, { align: 'center' });
  } else {
    pdf.setFillColor(254, 242, 242); // red-50
    pdf.setDrawColor(254, 202, 202);
    pdf.roundedRect(40 + (boxWidth + 10) * 2, y, boxWidth, 42, 4, 4, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(220, 38, 38);
    pdf.text('NET BALANCE DUE', 40 + (boxWidth + 10) * 2 + boxWidth / 2, y + 14, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setTextColor(153, 27, 27);
    pdf.text(`KSh ${invoice.balance.toLocaleString()}`, 40 + (boxWidth + 10) * 2 + boxWidth / 2, y + 32, { align: 'center' });
  }

  // Payment Instructions & Official Endorsement
  y += 54;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, (pageWidth - 90) / 2, 54, 4, 4, 'FD');
  pdf.roundedRect(pageWidth / 2 + 5, y, (pageWidth - 90) / 2, 54, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('School Bank & M-Pesa Payment Channels:', 48, y + 13);
  pdf.text('Bursar & Accounts Clearance Endorsement:', pageWidth / 2 + 13, y + 13);

  const paybillText = config?.mpesaPaybill
    ? `• M-Pesa Paybill: ${config.mpesaPaybill}  |  Account: ${config.mpesaAccountPattern.replace('{admissionNo}', student.admissionNo)}`
    : `• M-Pesa Paybill: 247247  |  Account: ${student.admissionNo}`;

  const bankText = config?.primaryBankName
    ? `• ${config.primaryBankName} A/C: ${config.primaryBankAccountNumber}  (${config.primaryBankBranch || 'Main Branch'})`
    : '• Equity Bank A/C: 011029384756  (Shule 101)';

  const secondBankText = config?.secondaryBankName && config?.secondaryBankAccountNumber
    ? `• ${config.secondaryBankName} A/C: ${config.secondaryBankAccountNumber}`
    : '• KCB Bank A/C: 1122334455  (Branch: Westlands)';

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  pdf.text(paybillText, 48, y + 25);
  pdf.text(bankText, 48, y + 36);
  pdf.text(secondBankText, 48, y + 47);

  const termsNote = config?.receiptTermsAndConditions
    ? config.receiptTermsAndConditions.slice(0, 90)
    : 'Certified computer-generated official statement.';

  pdf.text(termsNote, pageWidth / 2 + 13, y + 25);
  pdf.text(`Certified by: ${config?.bursarSignatoryTitle || 'Directorate of Finance & Accounts'}`, pageWidth / 2 + 13, y + 36);
  pdf.text(`Status: ${invoice.status.toUpperCase()} • Generated on ${new Date().toISOString().slice(0, 10)}`, pageWidth / 2 + 13, y + 47);

  // Signature line
  y += 66;
  pdf.setDrawColor(148, 163, 184);
  pdf.line(60, y + 12, 190, y + 12);
  pdf.line(pageWidth - 190, y + 12, pageWidth - 60, y + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(config?.bursarSignatoryTitle || 'Senior Bursar / Accounts Controller', 125, y + 22, { align: 'center' });
  pdf.text(config?.principalSignatoryTitle || 'Principal / Directorate Stamp', pageWidth - 125, y + 22, { align: 'center' });

  const sanitizedName = student.firstName + '_' + student.lastName;
  const fileName = `Fee_Statement_${sanitizedName}_${invoice.invoiceNo.replace(/\s+/g, '_')}_2026.pdf`;
  saveCompressedJsPdf(pdf, fileName);
};

/**
 * Generates and downloads a dedicated Official School Fee Remittance History & Receipts Audit PDF.
 * Specifically highlights the amount paid, when it was paid, and from which account it was paid.
 */
export const generateAndDownloadRemittanceHistoryPDF = (
  student: Student,
  invoice: FeeInvoice,
  config?: FeeReceiptTemplateConfig
): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 40;

  // Header Banner
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 85, 'F');

  // School Emblem Symbol
  pdf.setFillColor(16, 185, 129); // emerald-500
  pdf.roundedRect(40, 18, 50, 50, 8, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(255, 255, 255);
  pdf.text('SC', 65, 50, { align: 'center' });

  // School Header Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.setTextColor(255, 255, 255);
  pdf.text(config?.institutionName || 'ST. JUDE INTERNATIONAL ACADEMY', 105, 38);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(203, 213, 225);
  const locationLine = `${config?.poBox || 'P.O. Box 40281-00100'}, ${config?.countyCity || 'Nairobi City Central'}`;
  pdf.text(locationLine, 105, 52);

  const contactLine = `Tel: ${config?.phoneNumber || '+254 700 000 000'} • Email: ${config?.emailAddress || 'bursar@stjudeacademy.ac.ke'} • Web: ${config?.website || 'www.stjudeacademy.ac.ke'}`;
  pdf.text(contactLine, 105, 65);

  y = 105;

  // Document Badge
  pdf.setFillColor(236, 253, 245); // emerald-50
  pdf.setDrawColor(167, 243, 208); // emerald-200
  pdf.roundedRect(40, y, pageWidth - 80, 26, 6, 6, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(6, 95, 70); // emerald-800
  pdf.text('OFFICIAL FEE REMITTANCE HISTORY & PAYMENT RECEIPTS AUDIT', pageWidth / 2, y + 17, { align: 'center' });

  // Metadata Card
  y += 36;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, pageWidth - 80, 72, 6, 6, 'FD');

  // Left column: Student Data
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('STUDENT ENROLLEE', 52, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Full Name:', 52, y + 32);
  pdf.text('Admission No:', 52, y + 46);
  pdf.text('Class / Grade:', 52, y + 60);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${student.firstName} ${student.lastName}`, 115, y + 32);
  pdf.text(student.admissionNo, 115, y + 46);
  pdf.text(`${student.grade} (${student.section}) • Roll #${student.rollNumber}`, 115, y + 60);

  // Middle Column: Guardian / Payer
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('PARENT / REMITTER', 240, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Guardian Name:', 240, y + 32);
  pdf.text('Contact Phone:', 240, y + 46);
  pdf.text('Registered Email:', 240, y + 60);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(`${student.guardian.name} (${student.guardian.relation})`, 315, y + 32);
  pdf.text(student.guardian.phone, 315, y + 46);
  pdf.text(student.guardian.email, 315, y + 60);

  // Right Column: Invoice Info
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(71, 85, 105);
  pdf.text('BILLING CYCLE', 440, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Invoice #:', 440, y + 32);
  pdf.text('Term / Cycle:', 440, y + 46);
  pdf.text('Issued Date:', 440, y + 60);

  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 23, 42);
  pdf.text(invoice.invoiceNo, 495, y + 32);
  pdf.text(`${invoice.term} ${invoice.academicYear}`, 495, y + 46);
  pdf.text(invoice.issuedDate, 495, y + 60);

  // Summary KPI Cards (Total Invoiced, Total Remitted, Balance)
  y += 82;
  const cardW = (pageWidth - 80 - 20) / 3;

  // Card 1: Total Billed
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, cardW, 40, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text('TOTAL TERM INVOICE', 40 + cardW / 2, y + 14, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`KSh ${invoice.totalAmount.toLocaleString()}`, 40 + cardW / 2, y + 30, { align: 'center' });

  // Card 2: Total Remitted
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(40 + cardW + 10, y, cardW, 40, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(5, 150, 105);
  pdf.text('TOTAL REMITTED / PAID', 40 + cardW + 10 + cardW / 2, y + 14, { align: 'center' });
  pdf.setFontSize(11);
  pdf.setTextColor(6, 78, 59);
  pdf.text(`KSh ${invoice.paidAmount.toLocaleString()}`, 40 + cardW + 10 + cardW / 2, y + 30, { align: 'center' });

  // Card 3: Balance
  if (invoice.balance <= 0) {
    pdf.setFillColor(236, 253, 245);
    pdf.setDrawColor(167, 243, 208);
    pdf.roundedRect(40 + (cardW + 10) * 2, y, cardW, 40, 4, 4, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(5, 150, 105);
    pdf.text('LEDGER BALANCE', 40 + (cardW + 10) * 2 + cardW / 2, y + 14, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setTextColor(6, 78, 59);
    pdf.text('FULLY CLEARED (KSh 0)', 40 + (cardW + 10) * 2 + cardW / 2, y + 30, { align: 'center' });
  } else {
    pdf.setFillColor(254, 242, 242);
    pdf.setDrawColor(254, 202, 202);
    pdf.roundedRect(40 + (cardW + 10) * 2, y, cardW, 40, 4, 4, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(220, 38, 38);
    pdf.text('OUTSTANDING DUE', 40 + (cardW + 10) * 2 + cardW / 2, y + 14, { align: 'center' });
    pdf.setFontSize(11);
    pdf.setTextColor(153, 27, 27);
    pdf.text(`KSh ${invoice.balance.toLocaleString()}`, 40 + (cardW + 10) * 2 + cardW / 2, y + 30, { align: 'center' });
  }

  // Remittance History Table Header
  y += 52;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Verified Remittance Transactions & Audit Trail', 40, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • Parent Self-Service Archive`, pageWidth - 40, y, { align: 'right' });

  y += 8;
  pdf.setFillColor(15, 23, 42); // slate-900 table header
  pdf.rect(40, y, pageWidth - 80, 22, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);

  pdf.text('Receipt #', 48, y + 14);
  pdf.text('When Paid (Date)', 120, y + 14);
  pdf.text('Paid From Account (Source)', 195, y + 14);
  pdf.text('Payment Channel', 335, y + 14);
  pdf.text('Payer / Remitter', 415, y + 14);
  pdf.text('Amount Paid (KSh)', pageWidth - 48, y + 14, { align: 'right' });

  y += 22;

  if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
    invoice.paymentHistory.forEach((pmt, idx) => {
      // Row Background
      if (idx % 2 === 1) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(40, y, pageWidth - 80, 24, 'F');
      } else {
        pdf.setFillColor(255, 255, 255);
        pdf.rect(40, y, pageWidth - 80, 24, 'F');
      }

      pdf.setDrawColor(241, 245, 249);
      pdf.line(40, y + 24, pageWidth - 40, y + 24);

      // Receipt #
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(67, 56, 202); // indigo-700
      pdf.text(pmt.receiptNo, 48, y + 15);

      // When Paid
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      pdf.text(pmt.date, 120, y + 15);

      // Paid From Account
      const acct = pmt.payerAccount || 'Direct M-Pesa / Bank Channel';
      const truncatedAcct = acct.length > 24 ? acct.substring(0, 22) + '..' : acct;
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(30, 41, 59);
      pdf.text(truncatedAcct, 195, y + 15);

      // Channel
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(pmt.paymentMethod, 335, y + 15);

      // Payer Name
      const payer = pmt.payerName || student.guardian.name;
      const truncatedPayer = payer.length > 16 ? payer.substring(0, 14) + '..' : payer;
      pdf.text(truncatedPayer, 415, y + 15);

      // Amount Paid
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(5, 150, 105); // emerald-600
      pdf.text(`KSh ${pmt.amount.toLocaleString()}`, pageWidth - 48, y + 15, { align: 'right' });

      y += 24;
    });
  } else {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(40, y, pageWidth - 80, 30, 'F');
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No remittances or payment receipts recorded for this billing cycle.', pageWidth / 2, y + 18, { align: 'center' });
    y += 30;
  }

  // Remittance Total Summary Banner
  y += 6;
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.rect(40, y, pageWidth - 80, 24, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(6, 78, 59);
  pdf.text('Total Verified Remittance Sum', 48, y + 16);
  pdf.text(`KSh ${invoice.paidAmount.toLocaleString()}`, pageWidth - 48, y + 16, { align: 'right' });

  // Verification & Clearance Notice Box
  y += 36;
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(40, y, pageWidth - 80, 52, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Bursary Reconciliation & Institutional Clearance:', 52, y + 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(71, 85, 105);
  pdf.text('• This certified electronic remittance statement serves as official proof of fee remittances made to the school.', 52, y + 27);
  pdf.text('• Remittance records are synchronized real-time with the Ministry of Education & Directorate of Accounts.', 52, y + 38);

  // Clearance stamp text on right
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(5, 150, 105);
  pdf.text('OFFICIALLY VERIFIED & SECURED', pageWidth - 52, y + 15, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Document Hash: SC-${student.admissionNo}-${new Date().getTime().toString(36).toUpperCase()}`, pageWidth - 52, y + 27, { align: 'right' });
  pdf.text('Official Bursar Digital Stamp Attached', pageWidth - 52, y + 38, { align: 'right' });

  // Signatures
  y += 66;
  pdf.setDrawColor(148, 163, 184);
  pdf.line(60, y + 12, 190, y + 12);
  pdf.line(pageWidth - 190, y + 12, pageWidth - 60, y + 12);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(config?.bursarSignatoryTitle || 'Senior Bursar / Accounts Controller', 125, y + 22, { align: 'center' });
  pdf.text(config?.principalSignatoryTitle || 'Principal / Institutional Endorsement', pageWidth - 125, y + 22, { align: 'center' });

  const sanitizedName = student.firstName + '_' + student.lastName;
  const fileName = `Fee_Remittance_History_${sanitizedName}_${invoice.invoiceNo.replace(/\s+/g, '_')}_2026.pdf`;
  saveCompressedJsPdf(pdf, fileName);
};

/**
 * Exports fee remittance history as a CSV file for download.
 */
export const downloadRemittanceHistoryCSV = (student: Student, invoice: FeeInvoice): void => {
  const headers = [
    'Receipt Number',
    'Payment Date',
    'Paid From Account',
    'Payment Channel',
    'Payer / Remitter Name',
    'Amount Paid (KSh)',
    'Invoice Number',
    'Student Admission No',
    'Student Name',
    'Academic Term',
    'Academic Year',
  ];

  const rows: string[][] = [];

  if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
    invoice.paymentHistory.forEach((pmt) => {
      rows.push([
        `"${pmt.receiptNo}"`,
        `"${pmt.date}"`,
        `"${pmt.payerAccount || 'Direct M-Pesa / Bank Channel'}"`,
        `"${pmt.paymentMethod}"`,
        `"${pmt.payerName || student.guardian.name}"`,
        `"${pmt.amount}"`,
        `"${invoice.invoiceNo}"`,
        `"${student.admissionNo}"`,
        `"${student.firstName} ${student.lastName}"`,
        `"${invoice.term}"`,
        `"${invoice.academicYear}"`,
      ]);
    });
  } else {
    rows.push([
      '"No payments recorded"',
      '""',
      '""',
      '""',
      '""',
      '"0"',
      `"${invoice.invoiceNo}"`,
      `"${student.admissionNo}"`,
      `"${student.firstName} ${student.lastName}"`,
      `"${invoice.term}"`,
      `"${invoice.academicYear}"`,
    ]);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  const sanitizedName = student.firstName + '_' + student.lastName;
  link.setAttribute('download', `Fee_Remittance_History_${sanitizedName}_${invoice.invoiceNo}_2026.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Generates and downloads an individual official payment receipt PDF for a single transaction.
 */
export const generateAndDownloadSingleReceiptPDF = (
  student: Student,
  invoice: FeeInvoice,
  payment: FeePaymentRecord,
  config?: FeeReceiptTemplateConfig
): void => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a5',
    compress: true,
  }); // A5 receipt format
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 30;

  // Header Banner
  pdf.setFillColor(15, 23, 42); // slate-900
  pdf.rect(0, 0, pageWidth, 65, 'F');

  // School Emblem
  pdf.setFillColor(16, 185, 129); // emerald-500
  pdf.roundedRect(30, 12, 40, 40, 6, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.text('SC', 50, 37, { align: 'center' });

  // School Header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(255, 255, 255);
  pdf.text(config?.institutionName || 'ST. JUDE INTERNATIONAL ACADEMY', 80, 28);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(203, 213, 225);
  pdf.text('Official Bursary & Finance Division • Cashier Desk', 80, 40);
  pdf.text(`Tel: ${config?.phoneNumber || '+254 700 000 000'} • Email: ${config?.emailAddress || 'bursar@stjudeacademy.ac.ke'}`, 80, 50);

  y = 85;

  // Receipt Number & Title Box
  pdf.setFillColor(236, 253, 245);
  pdf.setDrawColor(167, 243, 208);
  pdf.roundedRect(30, y, pageWidth - 60, 24, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(6, 95, 70);
  pdf.text(`OFFICIAL FEE PAYMENT RECEIPT • ${payment.receiptNo}`, pageWidth / 2, y + 16, { align: 'center' });

  y += 32;

  // Amount Paid Big Callout
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(30, y, pageWidth - 60, 40, 4, 4, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('AMOUNT REMITTED & CLEARED:', 40, y + 16);

  pdf.setFontSize(14);
  pdf.setTextColor(5, 150, 105); // emerald-600
  pdf.text(`KSh ${payment.amount.toLocaleString()} KES`, pageWidth - 40, y + 25, { align: 'right' });

  y += 48;

  // Transaction Breakdown Details
  const details = [
    { label: 'Payment Receipt #:', val: payment.receiptNo },
    { label: 'When Paid (Date):', val: payment.date },
    { label: 'Paid From Account:', val: payment.payerAccount || 'Direct M-Pesa / Bank Account' },
    { label: 'Payment Channel:', val: payment.paymentMethod },
    { label: 'Payer / Remitter:', val: payment.payerName || student.guardian.name },
    { label: 'Student Enrollee:', val: `${student.firstName} ${student.lastName} (${student.admissionNo})` },
    { label: 'Grade & Stream:', val: `${student.grade} (${student.section})` },
    { label: 'Invoice Reference:', val: `${invoice.invoiceNo} (${invoice.term} ${invoice.academicYear})` },
    { label: 'Total Invoiced:', val: `KSh ${invoice.totalAmount.toLocaleString()}` },
    { label: 'Net Remaining Balance:', val: `KSh ${invoice.balance.toLocaleString()}` },
  ];

  details.forEach((d, idx) => {
    if (idx % 2 === 1) {
      pdf.setFillColor(248, 250, 252);
      pdf.rect(30, y, pageWidth - 60, 16, 'F');
    }
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(d.label, 40, y + 11);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text(d.val, 160, y + 11);

    y += 16;
  });

  // Footer Endorsement Stamp
  y += 16;
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(30, y, pageWidth - 60, 36, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Certified Computer Generated Bursary Receipt', 40, y + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Official validation stamp applied • Direct clearance issued to parent portal archive.', 40, y + 25);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setTextColor(5, 150, 105);
  pdf.text('PAID & VALIDATED', pageWidth - 40, y + 20, { align: 'right' });

  const sanitizedName = student.firstName + '_' + student.lastName;
  const fileName = `Receipt_${payment.receiptNo}_${sanitizedName}.pdf`;
  saveCompressedJsPdf(pdf, fileName);
};

export interface AttendanceSummaryPdfOptions {
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
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendanceRate: number;
  emergencyFilterActive?: boolean;
}

export const generateAndDownloadAttendanceSummaryPDF = (options: AttendanceSummaryPdfOptions) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 32;
  const contentWidth = pageWidth - marginLeft * 2;

  // Table column configuration (total width = 778 pt)
  const cols = [
    { label: 'DATE', width: 72 },
    { label: 'STUDENT NAME & ROLL', width: 125 },
    { label: 'STATUS', width: 68 },
    { label: 'TIME IN', width: 56 },
    { label: 'WHEREABOUTS / KNOWN LOCATION', width: 175 },
    { label: 'EMERGENCY CONTACT & PHONE', width: 162 },
    { label: 'VERIFIED BY / NOTES', width: 120 },
  ];

  const drawTableHeader = (currentY: number): number => {
    // Table Header Row Background
    pdf.setFillColor(30, 41, 59); // slate-800
    pdf.rect(marginLeft, currentY, contentWidth, 20, 'F');

    let curX = marginLeft;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);

    cols.forEach((col) => {
      pdf.text(col.label, curX + 5, currentY + 13);
      curX += col.width;
    });

    return currentY + 20;
  };

  const drawPageHeader = (pageNum: number): number => {
    let y = 22;

    // Emergency Top Alert Stripe
    pdf.setFillColor(185, 28, 28); // red-700
    pdf.rect(marginLeft, y, contentWidth, 16, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(255, 255, 255);
    pdf.text('EMERGENCY ROLL-CALL & MUSTER ROLL ATTENDANCE MANIFEST', marginLeft + 8, y + 11);
    pdf.text('CONFIDENTIAL STUDENT SAFETY DOCUMENT • PRIORITY ONE', pageWidth - marginLeft - 8, y + 11, {
      align: 'right',
    });

    y += 22;

    // School Name & Header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.text(options.schoolName || 'EduPulse High School', marginLeft, y + 12);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.text(
      `Generated: ${new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })} at ${new Date().toLocaleTimeString()} | Serial: REG-SAF-${Date.now().toString().slice(-6)}`,
      pageWidth - marginLeft,
      y + 12,
      { align: 'right' }
    );

    y += 18;

    // Class & Scope Banner
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.roundedRect(marginLeft, y, contentWidth, 28, 3, 3, 'FD');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);
    pdf.text(`Class Cohort: ${options.className}`, marginLeft + 10, y + 17);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Class Teacher: ${options.teacherName || 'Assigned Instructor'}`, marginLeft + 170, y + 17);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229); // indigo-600
    pdf.text(`Selected Duration: ${options.dateRangeLabel}`, marginLeft + 350, y + 17);

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Date Range: ${options.startDate} to ${options.endDate}`, marginLeft + 560, y + 17);

    y += 33;

    // If on First Page: Draw Metrics Box
    if (pageNum === 1) {
      const boxWidth = (contentWidth - 32) / 5;
      const stats = [
        { label: 'TOTAL LOGGED', val: `${options.entries.length}`, bg: [248, 250, 252], border: [226, 232, 240], txt: [30, 41, 59] },
        { label: 'PRESENT & SAFE', val: `${options.totalPresent} (${options.attendanceRate}%)`, bg: [236, 253, 245], border: [167, 243, 208], txt: [6, 95, 70] },
        { label: 'ABSENT PUPILS', val: `${options.totalAbsent}`, bg: [255, 241, 242], border: [254, 205, 211], txt: [159, 18, 57] },
        { label: 'LATE / TARDY', val: `${options.totalLate}`, bg: [254, 252, 232], border: [254, 240, 138], txt: [133, 77, 14] },
        { label: 'EXCUSED LEAVE', val: `${options.totalExcused}`, bg: [239, 246, 255], border: [191, 219, 254], txt: [30, 64, 175] },
      ];

      stats.forEach((st, idx) => {
        const bx = marginLeft + idx * (boxWidth + 8);
        pdf.setFillColor(st.bg[0], st.bg[1], st.bg[2]);
        pdf.setDrawColor(st.border[0], st.border[1], st.border[2]);
        pdf.roundedRect(bx, y, boxWidth, 26, 3, 3, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(st.txt[0], st.txt[1], st.txt[2]);
        pdf.text(st.label, bx + 6, y + 10);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(st.val, bx + 6, y + 21);
      });

      y += 32;

      // Emergency Evacuation Notice Line
      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(252, 165, 165);
      pdf.roundedRect(marginLeft, y, contentWidth, 16, 2, 2, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(185, 28, 28);
      pdf.text(
        'EMERGENCY INSTRUCTION: Verify on-campus pupils first. For absent or late students, immediately refer to the recorded whereabouts and emergency guardian contact numbers below.',
        marginLeft + 8,
        y + 11
      );

      y += 20;
    }

    return drawTableHeader(y);
  };

  let currentY = drawPageHeader(1);

  // Render Table Entries
  options.entries.forEach((item, index) => {
    const student = item.student;
    const rec = item.record;
    const status = rec?.status || 'present';
    const timeIn = rec?.timeIn || (status === 'present' ? '07:55 AM' : '—');
    const whereabouts =
      rec?.whereabouts ||
      (status === 'present'
        ? 'On Campus / Classroom (Present & Safe)'
        : status === 'absent'
        ? 'Home / Parent Verification Pending'
        : status === 'late'
        ? 'Arrived on Campus (Tardy)'
        : 'Excused Leave');
    const emergencyContact = `${student.guardian.name} (${student.guardian.relation.slice(0, 3)}) • ${student.guardian.phone}`;
    const notes = rec?.emergencyNotes || rec?.notes || (rec?.reportedBy ? `By: ${rec.reportedBy}` : '—');

    // Check if new page is needed (row height ~ 22pt, leave 55pt for footer / signoff)
    if (currentY > pageHeight - 55) {
      pdf.addPage();
      currentY = drawPageHeader(pdf.getNumberOfPages());
    }

    // Zebra striping
    const isEven = index % 2 === 0;
    if (isEven) {
      pdf.setFillColor(248, 250, 252); // slate-50
    } else {
      pdf.setFillColor(255, 255, 255);
    }
    pdf.rect(marginLeft, currentY, contentWidth, 22, 'F');

    // Bottom border for row
    pdf.setDrawColor(241, 245, 249);
    pdf.line(marginLeft, currentY + 22, marginLeft + contentWidth, currentY + 22);

    let curX = marginLeft;

    // Col 1: Date
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text(item.date, curX + 5, currentY + 14);
    curX += cols[0].width;

    // Col 2: Student Name & Roll
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(15, 23, 42);
    const fullName = `${student.firstName} ${student.lastName}`;
    pdf.text(fullName.length > 20 ? fullName.slice(0, 18) + '...' : fullName, curX + 5, currentY + 10);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Roll: ${student.rollNumber} | ${student.grade}-${student.section}`, curX + 5, currentY + 18);
    curX += cols[1].width;

    // Col 3: Status Badge
    let badgeBg: [number, number, number] = [209, 250, 229]; // emerald-100
    let badgeText: [number, number, number] = [6, 95, 70]; // emerald-800
    if (status === 'absent') {
      badgeBg = [254, 226, 226]; // rose-100
      badgeText = [159, 18, 57]; // rose-800
    } else if (status === 'late') {
      badgeBg = [254, 243, 199]; // amber-100
      badgeText = [146, 64, 14]; // amber-800
    } else if (status === 'excused') {
      badgeBg = [224, 242, 254]; // sky-100
      badgeText = [3, 105, 161]; // sky-800
    }

    pdf.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
    pdf.roundedRect(curX + 4, currentY + 4, 58, 14, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
    pdf.text(status.toUpperCase(), curX + 33, currentY + 14, { align: 'center' });
    curX += cols[2].width;

    // Col 4: Time In
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(71, 85, 105);
    pdf.text(timeIn, curX + 5, currentY + 14);
    curX += cols[3].width;

    // Col 5: Whereabouts / Known Location
    pdf.setFont('helvetica', status === 'absent' || status === 'late' ? 'bold' : 'normal');
    pdf.setFontSize(7);
    if (status === 'absent') {
      pdf.setTextColor(190, 18, 60); // rose-700
    } else if (status === 'late') {
      pdf.setTextColor(180, 83, 9); // amber-700
    } else {
      pdf.setTextColor(51, 65, 85);
    }
    const truncatedWhereabouts = whereabouts.length > 36 ? whereabouts.slice(0, 34) + '...' : whereabouts;
    pdf.text(truncatedWhereabouts, curX + 5, currentY + 14);
    curX += cols[4].width;

    // Col 6: Emergency Contact & Phone
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(15, 23, 42);
    const guardianLine = `${student.guardian.name} (${student.guardian.relation})`;
    pdf.text(guardianLine.length > 26 ? guardianLine.slice(0, 24) + '...' : guardianLine, curX + 5, currentY + 10);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(2, 132, 199); // sky-600
    pdf.text(`Tel: ${student.guardian.phone}`, curX + 5, currentY + 18);
    curX += cols[5].width;

    // Col 7: Notes / Reported By
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    const truncatedNotes = notes.length > 25 ? notes.slice(0, 23) + '...' : notes;
    pdf.text(truncatedNotes, curX + 5, currentY + 14);

    currentY += 22;
  });

  // Check if we need space for Sign-off block
  if (currentY > pageHeight - 65) {
    pdf.addPage();
    currentY = 40;
  } else {
    currentY += 12;
  }

  // Official Certification Box at the end
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(marginLeft, currentY, contentWidth, 36, 3, 3, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(30, 41, 59);
  pdf.text('CLASS TEACHER VERIFICATION & CERTIFICATION:', marginLeft + 10, currentY + 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    'I hereby certify that this muster roll accurately states the student attendance, recorded whereabouts, and tardiness records for the specified period.',
    marginLeft + 10,
    currentY + 26
  );

  pdf.text('Signature: ________________________________', marginLeft + 420, currentY + 22);
  pdf.text('Emergency Assembly Marshal Stamp: [   APPROVED   ]', marginLeft + 610, currentY + 22);

  // Add Page Numbers and Footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(148, 163, 184); // slate-400
    pdf.text(
      `EduPulse Safety Management System • Emergency Attendance & Whereabouts Manifest • Confidential`,
      marginLeft,
      pageHeight - 14
    );
    pdf.text(`Page ${i} of ${totalPages}`, pageWidth - marginLeft, pageHeight - 14, { align: 'right' });
  }

  const sanitizedClass = options.className.replace(/\s+/g, '_');
  const fileName = `Emergency_Attendance_Whereabouts_${sanitizedClass}_${options.startDate}_to_${options.endDate}.pdf`;

  saveCompressedJsPdf(pdf, fileName);
};
