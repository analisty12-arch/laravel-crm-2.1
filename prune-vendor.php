<?php

// Prune heavy fonts from mpdf to stay under 250MB on Vercel
$fontsDir = 'vendor/mpdf/mpdf/ttfonts';

if (is_dir($fontsDir)) {
    echo "Pruning heavy fonts from $fontsDir...\n";
    $files = glob("$fontsDir/NotoSans*") ?: [];
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
            echo "Removed: " . basename($file) . "\n";
        }
    }

    // Also remove some other non-latin heavy fonts
    $otherHeavy = [
        'HanaMinA.ttf',
        'HanaMinB.ttf',
        'Sun-ExtA.ttf',
        'Sun-ExtB.ttf'
    ];

    foreach ($otherHeavy as $font) {
        $path = "$fontsDir/$font";
        if (is_file($path)) {
            unlink($path);
            echo "Removed heavy font: $font\n";
        }
    }
}
echo "Pruning complete.\n";
