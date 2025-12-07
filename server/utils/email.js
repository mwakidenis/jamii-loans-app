const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

// Send welcome email after registration
const sendWelcomeEmail = async (user) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to JAMII Loan - Account Created Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to JAMII Loan, ${user.fullName}!</h2>
          <p>Your account has been created successfully. Here are your account details:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Full Name:</strong> ${user.fullName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>National ID:</strong> ${user.nationalId}</p>
            <p><strong>Credit Score:</strong> ${user.creditScore}</p>
            <p><strong>Loan Limit:</strong> KSh ${user.loanLimit.toLocaleString()}</p>
          </div>
          <p>You can now apply for loans through our platform. Make sure to check your eligibility before applying.</p>
          <p>If you have any questions, feel free to contact our support team.</p>
          <br>
          <p>Best regards,<br>JAMII Loan Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

// Send loan application confirmation email
const sendLoanApplicationEmail = async (user, loan) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'JAMII Loan - Application Submitted Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Loan Application Submitted, ${user.fullName}!</h2>
          <p>Your loan application has been submitted successfully. Here are the details:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Loan Amount:</strong> KSh ${loan.amount.toLocaleString()}</p>
            <p><strong>Processing Fee (10%):</strong> KSh ${loan.feeAmount.toLocaleString()}</p>
            <p><strong>Description:</strong> ${loan.description}</p>
            <p><strong>Application Date:</strong> ${new Date(loan.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
          </div>
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Our admin team will review your application within 24-48 hours</li>
            <li>If approved, you'll receive a notification to pay the processing fee</li>
            <li>Once the fee is paid, your loan will be disbursed to your M-PESA account</li>
          </ol>
          <p>You can track your application status in your dashboard.</p>
          <br>
          <p>Best regards,<br>JAMII Loan Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Loan application email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending loan application email:', error);
    return { success: false, error: error.message };
  }
};

// Send loan approval email
const sendLoanApprovalEmail = async (user, loan) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'JAMII Loan - Application Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations ${user.fullName}! Your Loan is Approved</h2>
          <p>Great news! Your loan application has been approved. Here are the details:</p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>Loan Amount:</strong> KSh ${loan.amount.toLocaleString()}</p>
            <p><strong>Processing Fee:</strong> KSh ${loan.feeAmount.toLocaleString()} ${loan.feePaid ? '(Paid)' : '(Pending Payment)'}</p>
            <p><strong>Approval Date:</strong> ${new Date(loan.approvalDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #10b981;">Approved</span></p>
          </div>
          ${!loan.feePaid ? `
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Next Step:</strong> Please pay the processing fee of KSh ${loan.feeAmount.toLocaleString()} via M-PESA to complete the process.</p>
            <p>You'll receive M-PESA payment instructions in your dashboard.</p>
          </div>
          ` : `
          <p>Your loan will be disbursed to your M-PESA account shortly after fee payment confirmation.</p>
          `}
          <p>Thank you for choosing JAMII Loan!</p>
          <br>
          <p>Best regards,<br>JAMII Loan Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Loan approval email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending loan approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send loan rejection email
const sendLoanRejectionEmail = async (user, loan) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'JAMII Loan - Application Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Loan Application Update</h2>
          <p>Dear ${user.fullName},</p>
          <p>We regret to inform you that your loan application has been reviewed and unfortunately, we are unable to approve it at this time.</p>
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p><strong>Loan Amount Applied:</strong> KSh ${loan.amount.toLocaleString()}</p>
            <p><strong>Application Date:</strong> ${new Date(loan.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #dc2626;">Rejected</span></p>
            ${loan.rejectionReason ? `<p><strong>Reason:</strong> ${loan.rejectionReason}</p>` : ''}
          </div>
          <p>You can apply for a new loan after improving your credit score or addressing the issues mentioned.</p>
          <p>If you have any questions about this decision, please contact our support team.</p>
          <br>
          <p>Best regards,<br>JAMII Loan Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Loan rejection email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending loan rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send loan disbursement email
const sendLoanDisbursementEmail = async (user, loan) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'JAMII Loan - Funds Disbursed Successfully!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Loan Disbursed Successfully!</h2>
          <p>Dear ${user.fullName},</p>
          <p>Great news! Your approved loan has been successfully disbursed to your M-PESA account.</p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>Loan Amount Disbursed:</strong> KSh ${loan.amount.toLocaleString()}</p>
            <p><strong>Transaction ID:</strong> ${loan.disbursementTransactionId}</p>
            <p><strong>Disbursement Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>The funds should be available in your M-PESA account within a few minutes. Please check your phone for the M-PESA confirmation message.</p>
          <p><strong>Important:</strong> Remember to repay your loan on time to maintain a good credit score.</p>
          <p>Thank you for choosing JAMII Loan!</p>
          <br>
          <p>Best regards,<br>JAMII Loan Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Loan disbursement email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending loan disbursement email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLoanApplicationEmail,
  sendLoanApprovalEmail,
  sendLoanRejectionEmail,
  sendLoanDisbursementEmail,
};
