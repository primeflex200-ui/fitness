# Prime Flex App Icon Generator
# This script generates all required Android launcher icons from your source image

Write-Host "🎨 Prime Flex App Icon Generator" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Source image path
$sourceImage = "C:\Users\ksair\OneDrive\Pictures\WhatsApp Image 2025-09-10 at 3.30.25 PM (1).jpeg"

# Check if source image exists
if (-not (Test-Path $sourceImage)) {
    Write-Host "❌ Error: Source image not found!" -ForegroundColor Red
    Write-Host "Expected location: $sourceImage" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please ensure the image exists at the specified location." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Source image found: $sourceImage" -ForegroundColor Green
Write-Host ""

# Output directory
$outputDir = "android\app\src\main\res"

# Check if output directory exists
if (-not (Test-Path $outputDir)) {
    Write-Host "❌ Error: Android res directory not found!" -ForegroundColor Red
    Write-Host "Expected location: $outputDir" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run this script from the flex-zen-coach project root." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Output directory found: $outputDir" -ForegroundColor Green
Write-Host ""

# Check if ImageMagick is installed
$imageMagickInstalled = $false
try {
    $null = magick -version 2>&1
    $imageMagickInstalled = $true
    Write-Host "✅ ImageMagick is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  ImageMagick not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Icon Generation Options:" -ForegroundColor Cyan
Write-Host "1. Use Android Asset Studio (Recommended - Opens browser)" -ForegroundColor White
Write-Host "2. Use ImageMagick (Automatic - Requires ImageMagick)" -ForegroundColor White
Write-Host "3. Use Capacitor Assets (Automatic - Requires npm package)" -ForegroundColor White
Write-Host "4. Manual Instructions" -ForegroundColor White
Write-Host "5. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select an option (1-5)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Opening Android Asset Studio..." -ForegroundColor Cyan
        Start-Process "https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html"
        Write-Host ""
        Write-Host "📋 Instructions:" -ForegroundColor Yellow
        Write-Host "1. Click 'Image' tab" -ForegroundColor White
        Write-Host "2. Click 'Choose File' and select your image:" -ForegroundColor White
        Write-Host "   $sourceImage" -ForegroundColor Gray
        Write-Host "3. Adjust padding and settings as needed" -ForegroundColor White
        Write-Host "4. Click 'Download' button" -ForegroundColor White
        Write-Host "5. Extract the ZIP file" -ForegroundColor White
        Write-Host "6. Copy all mipmap folders to:" -ForegroundColor White
        Write-Host "   $outputDir" -ForegroundColor Gray
        Write-Host ""
        Write-Host "✅ After copying, rebuild your app:" -ForegroundColor Green
        Write-Host "   npm run build" -ForegroundColor Gray
        Write-Host "   npx cap sync android" -ForegroundColor Gray
        Write-Host "   npx cap open android" -ForegroundColor Gray
    }
    
    "2" {
        if (-not $imageMagickInstalled) {
            Write-Host ""
            Write-Host "❌ ImageMagick is not installed!" -ForegroundColor Red
            Write-Host ""
            Write-Host "Please install ImageMagick:" -ForegroundColor Yellow
            Write-Host "1. Download from: https://imagemagick.org/script/download.php" -ForegroundColor White
            Write-Host "2. Or use Chocolatey: choco install imagemagick" -ForegroundColor White
            Write-Host ""
            Write-Host "After installation, run this script again." -ForegroundColor Yellow
        } else {
            Write-Host ""
            Write-Host "🔄 Generating icons with ImageMagick..." -ForegroundColor Cyan
            Write-Host ""
            
            # Define icon sizes
            $sizes = @(
                @{density="mdpi"; size=48},
                @{density="hdpi"; size=72},
                @{density="xhdpi"; size=96},
                @{density="xxhdpi"; size=144},
                @{density="xxxhdpi"; size=192}
            )
            
            foreach ($config in $sizes) {
                $folder = "$outputDir\mipmap-$($config.density)"
                $size = $config.size
                
                Write-Host "Creating $($config.density) icons ($size x $size)..." -ForegroundColor White
                
                # Create ic_launcher.png
                magick "$sourceImage" -resize "$size`x$size" -gravity center -extent "$size`x$size" "$folder\ic_launcher.png"
                
                # Create ic_launcher_round.png
                magick "$sourceImage" -resize "$size`x$size" -gravity center -extent "$size`x$size" "$folder\ic_launcher_round.png"
                
                Write-Host "  ✅ Created $folder\ic_launcher.png" -ForegroundColor Green
                Write-Host "  ✅ Created $folder\ic_launcher_round.png" -ForegroundColor Green
            }
            
            Write-Host ""
            Write-Host "🎉 All icons generated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Yellow
            Write-Host "1. npm run build" -ForegroundColor Gray
            Write-Host "2. npx cap sync android" -ForegroundColor Gray
            Write-Host "3. npx cap open android" -ForegroundColor Gray
            Write-Host "4. Build APK in Android Studio" -ForegroundColor Gray
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔄 Using Capacitor Assets..." -ForegroundColor Cyan
        Write-Host ""
        
        # Check if resources folder exists
        if (-not (Test-Path "resources")) {
            Write-Host "Creating resources folder..." -ForegroundColor White
            New-Item -ItemType Directory -Path "resources" | Out-Null
        }
        
        # Copy source image to resources/icon.png
        Write-Host "Copying source image to resources/icon.png..." -ForegroundColor White
        Copy-Item $sourceImage "resources\icon.png" -Force
        
        Write-Host "Running Capacitor Assets generator..." -ForegroundColor White
        Write-Host ""
        
        # Run capacitor-assets
        npx @capacitor/assets generate --android
        
        Write-Host ""
        Write-Host "✅ Icons generated!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. npm run build" -ForegroundColor Gray
        Write-Host "2. npx cap sync android" -ForegroundColor Gray
        Write-Host "3. npx cap open android" -ForegroundColor Gray
    }
    
    "4" {
        Write-Host ""
        Write-Host "📋 Manual Icon Generation Instructions:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Required Icon Sizes:" -ForegroundColor Yellow
        Write-Host "  mdpi:    48 x 48 px" -ForegroundColor White
        Write-Host "  hdpi:    72 x 72 px" -ForegroundColor White
        Write-Host "  xhdpi:   96 x 96 px" -ForegroundColor White
        Write-Host "  xxhdpi:  144 x 144 px" -ForegroundColor White
        Write-Host "  xxxhdpi: 192 x 192 px" -ForegroundColor White
        Write-Host ""
        Write-Host "Steps:" -ForegroundColor Yellow
        Write-Host "1. Open your image in a photo editor (Photoshop, GIMP, Paint.NET)" -ForegroundColor White
        Write-Host "2. Resize to each size listed above" -ForegroundColor White
        Write-Host "3. Keep the image centered with padding" -ForegroundColor White
        Write-Host "4. Save as PNG with transparent background" -ForegroundColor White
        Write-Host "5. Name each file: ic_launcher.png and ic_launcher_round.png" -ForegroundColor White
        Write-Host "6. Copy to respective mipmap folders:" -ForegroundColor White
        Write-Host "   $outputDir\mipmap-mdpi\" -ForegroundColor Gray
        Write-Host "   $outputDir\mipmap-hdpi\" -ForegroundColor Gray
        Write-Host "   $outputDir\mipmap-xhdpi\" -ForegroundColor Gray
        Write-Host "   $outputDir\mipmap-xxhdpi\" -ForegroundColor Gray
        Write-Host "   $outputDir\mipmap-xxxhdpi\" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Source image location:" -ForegroundColor Yellow
        Write-Host "  $sourceImage" -ForegroundColor Gray
    }
    
    "5" {
        Write-Host ""
        Write-Host "👋 Exiting..." -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid option selected!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📖 For detailed instructions, see: REPLACE_APP_ICON_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
pause
