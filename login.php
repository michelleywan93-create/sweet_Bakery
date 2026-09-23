<?php
require 'config.php';

$error = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $user = trim($_POST['username']);
    $pass = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $user, $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        if (password_verify($pass, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['full_name'] = $row['full_name'];
            header("Location: index.php");
            exit;
        }
    }
    $error = "Nama pengguna/e-mel atau kata laluan salah!";
}
?>
<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk · SweetStock</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #fff5fa;
            --primary: #d65f94;
            --primary-dark: #b84a7c;
            --muted: #a07d94;
            --error: #c03e70;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: "Inter", sans-serif;
            background: var(--bg);
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 20px;
        }
        .auth-card {
            background: white;
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 12px 35px rgba(214,95,148,0.15);
        }
        .auth-header {
            text-align: center;
            margin-bottom: 24px;
        }
        .auth-icon { font-size: 40px; }
        h1 {
            font-family: "Playfair Display", serif;
            color: #7a3b60;
            margin: 10px 0 4px;
        }
        p.desc { color: var(--muted); margin: 0; }
        .alert {
            padding: 12px;
            border-radius: 12px;
            margin-bottom: 16px;
            background: #ffe9f2;
            color: var(--error);
        }
        form { display: grid; gap: 14px; }
        label {
            font-size: 13px;
            font-weight: 600;
            color: #5a4050;
        }
        input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid #f4d9e9;
            border-radius: 12px;
            font-size: 15px;
            outline: none;
        }
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(214,95,148,0.1); }
        button {
            background: linear-gradient(135deg, #e86fb0, #d65f94);
            color: white;
            border: none;
            padding: 13px;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
        }
        button:hover { background: var(--primary-dark); }
        .link {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: var(--muted);
        }
        .link a { color: var(--primary); text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="auth-card">
        <div class="auth-header">
            <div class="auth-icon">🧁</div>
            <h1>Masuk Akaun</h1>
            <p class="desc">SweetStock — Bakery Inventory</p>
        </div>
        <?php if ($error): ?><div class="alert"><?= $error ?></div><?php endif; ?>
        <form method="post">
            <label>Nama Pengguna / E-mel</label>
            <input type="text" name="username" required placeholder="Masuk nama atau e-mel">
            <label>Kata Laluan</label>
            <input type="password" name="password" required placeholder="Masuk kata laluan">
            <button type="submit">Masuk 🚪</button>
        </form>
        <div class="link">Belum ada akaun? <a href="signup.php">Daftar sekarang</a></div>
    </div>
</body>
</html>
