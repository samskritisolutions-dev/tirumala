<?php
/**
 * THIRUMALA CONSTRUCTIONS & DEVELOPERS (Tirumala Nirmaan)
 * Production PHP Form Handler & Lead Management Script
 */

// Strict error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Configuration
define('COMPANY_NAME', 'Thirumala Constructions & Developers (Tirumala Nirmaan)');
define('NOTIFICATION_EMAIL', 'thirumalacd2010@gmail.com');
define('LEADS_FILE', __DIR__ . '/data/leads.csv');

// Set JSON header for API/AJAX callers
$is_ajax = false;
if (
    (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
    (!empty($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false) ||
    isset($_POST['ajax'])
) {
    $is_ajax = true;
}

// Ensure POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        exit;
    } else {
        header('Location: ./');
        exit;
    }
}

// 1. Anti-Spam Honeypot Verification
if (!empty($_POST['hp_field'])) {
    // Spambot detected; pretend success to dismiss bot without processing
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['status' => 'success', 'message' => 'Your request has been received.']);
        exit;
    } else {
        header('Location: thank-you');
        exit;
    }
}

// 2. Data Sanitization & Extraction
$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$project = isset($_POST['project']) ? trim(strip_tags($_POST['project'])) : 'General Enquiry';
$date = isset($_POST['date']) ? trim(strip_tags($_POST['date'])) : '';
$time = isset($_POST['time']) ? trim(strip_tags($_POST['time'])) : '';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
$source_page = isset($_POST['source_page']) ? trim(strip_tags($_POST['source_page'])) : (isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Direct');

$ip_address = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
$timestamp = date('Y-m-d H:i:s');

// 3. Validation
$errors = [];

if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Please enter your full name.';
}

$clean_phone = preg_replace('/[^\d+]/', '', $phone);
if (empty($clean_phone) || strlen($clean_phone) < 10) {
    $errors[] = 'Please provide a valid 10-digit mobile number.';
}

if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (!empty($errors)) {
    if ($is_ajax) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => implode(' ', $errors)]);
        exit;
    } else {
        echo "<script>alert('" . addslashes(implode(' ', $errors)) . "'); window.history.back();</script>";
        exit;
    }
}

// 4. Lead Logging to CSV (Guarantees zero lead loss regardless of mail server status)
if (!file_exists(dirname(LEADS_FILE))) {
    mkdir(dirname(LEADS_FILE), 0755, true);
}

$is_new_file = !file_exists(LEADS_FILE);
$csv_handle = @fopen(LEADS_FILE, 'a');
if ($csv_handle) {
    if ($is_new_file) {
        fputcsv($csv_handle, ['Timestamp', 'Name', 'Phone', 'Email', 'Project', 'Date', 'Time', 'Message', 'Source Page', 'IP Address']);
    }
    fputcsv($csv_handle, [$timestamp, $name, $phone, $email, $project, $date, $time, $message, $source_page, $ip_address]);
    fclose($csv_handle);
}

// 5. Send Professional HTML Email Notification via PHP mail()
$to = NOTIFICATION_EMAIL;
$subject = "New Site Tour Request: " . $project . " - " . $name;

$email_content = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Property Enquiry</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 4px solid #c9933b;">
    <div style="background: #0c2340; padding: 24px; color: #ffffff; text-align: center;">
      <h2 style="margin: 0 0 6px 0; font-size: 22px;">Thirumala Constructions & Developers</h2>
      <p style="margin: 0; font-size: 13px; color: #e2e8f0; letter-spacing: 0.05em; font-weight: bold;">TIRUMALA NIRMAAN &bull; NEW SITE VISIT REQUEST</p>
    </div>
    <div style="padding: 24px;">
      <h3 style="color: #0c2340; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">Customer Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Customer Name:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' . htmlspecialchars($name) . '</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Phone Number:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="tel:' . htmlspecialchars($phone) . '" style="color: #0c2340; font-weight: bold; text-decoration: none;">' . htmlspecialchars($phone) . '</a></td>
        </tr>';

if (!empty($email)) {
    $email_content .= '
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Email Address:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;"><a href="mailto:' . htmlspecialchars($email) . '">' . htmlspecialchars($email) . '</a></td>
        </tr>';
}

$email_content .= '
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Selected Project:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: #b45309; font-weight: bold;">' . htmlspecialchars($project) . '</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Preferred Date:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' . (!empty($date) ? htmlspecialchars($date) : 'Flexible / To be confirmed') . '</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Preferred Time:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' . (!empty($time) ? htmlspecialchars($time) : 'Flexible / Morning / Afternoon') . '</td>
        </tr>';

if (!empty($message)) {
    $email_content .= '
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Remarks / Requirement:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' . nl2br(htmlspecialchars($message)) . '</td>
        </tr>';
}

$email_content .= '
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">Submitted On:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">' . $timestamp . '</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold;">Source Page:</td>
          <td style="padding: 10px; font-size: 13px; color: #64748b;">' . htmlspecialchars($source_page) . '</td>
        </tr>
      </table>

      <div style="margin-top: 25px; padding: 15px; background: #ecfdf5; border-radius: 6px; text-align: center;">
        <a href="tel:' . htmlspecialchars($phone) . '" style="display: inline-block; background: #0c2340; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-right: 10px;">Call Customer Now</a>
        <a href="https://wa.me/' . preg_replace('/[^\d]/', '', $phone) . '" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">WhatsApp Customer</a>
      </div>
    </div>
    <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
      This lead was automatically captured through the official Thirumala Constructions website.
    </div>
  </div>
</body>
</html>
';

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: Thirumala Website Leads <no-reply@thirumalaconstructions.com>',
    'X-Mailer: PHP/' . phpversion()
];

if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $email;
}

// Send email (suppressed warning to avoid breaking in environments where sendmail is absent)
@mail($to, $subject, $email_content, implode("\r\n", $headers));

// 6. Response Output
if ($is_ajax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you, ' . htmlspecialchars($name) . '! Your site visit request has been received. Our senior engineer will contact you shortly.'
    ]);
    exit;
} else {
    header('Location: thank-you');
    exit;
}
