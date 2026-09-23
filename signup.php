<?php
require 'config.php';

$error = $success = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['full_name']);
    $user = trim($_POST['username']);
    $email = trim($_POST['email']);
    $pass = $_POST['password'];

    if (empty($name) || empty($user) || empty($email) || empty($pass)) {
        $error = "Sila isi semua medan!";
    } elseif (strlen($pass) < 6) {
        $error = "Kata laluan sekurang-kurangnya 6 aksara!";
    } else {
        $check = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $check->bind_param("ss", $user, $email);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            $error = "Nama pengguna atau e-mel sudah wujud!";
        } else {
            $hash = password_hash($pass, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $name, $user, $email, $hash);
            if ($stmt->execute()) {
                $success = "Akaun berjaya dibuat! Sila <a href='login.php'>masuk</a>.";
            } else {
                $error = "Ralat: " . $conn->error;
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar · SweetStock</title>
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
            --success: #267247;
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
        }
        .alert.error { background: #ffe9f2; color: var(--error); }
        .alert.success { background: #e7f6ed; color: var(--success); }
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
            <h1>Daftar Akaun</h1>
            <p class="desc">SweetStock — Bakery Inventory</p>
        </div>
        <?php if ($error): ?><div class="alert error"><?= $error ?></div><?php endif; ?>
        <?php if ($success): ?><div class="alert success"><?= $success ?></div><?php endif; ?>
        <form method="post">
            <label>Nama Penuh</label>
            <input type="text" name="full_name" required placeholder="Contoh: Siti Aisyah">
            <label>Nama Pengguna</label>
            <input type="text" name="username" required placeholder="Contoh: siti123">
            <label>E-mel</label>
            <input type="email" name="email" required placeholder="contoh@email.com">
            <label>Kata Laluan</label>
            <input type="password" name="password" required placeholder="Min. 6 aksara">
            <button type="submit">Daftar ✨</button>
        </form>
        <div class="link">Sudah ada akaun? <a href="login.php">Masuk di sini</a></div>
    </div>
</body>
</html>
