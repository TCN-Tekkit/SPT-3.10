@Echo Off
echo Для начала проверю, а не работаем ли Мы от Имени Администратора? - First of all, I'll check if We are working on behalf of the Administrator?
FSUTIL dirty query %SystemDrive% >nul
if %errorlevel% EQU 0 goto START

echo Ну а теперь сам скрипт для запуска от Имени Администратора - Well, now the script itself to run as an Administrator
ver |>NUL find /v "5." && if "%~1"=="" (
  Echo CreateObject^("Shell.Application"^).ShellExecute WScript.Arguments^(0^),"1","","runas",1 >"%temp%\Elevating.vbs"
  cscript.exe //nologo "%temp%\Elevating.vbs" "%~f0"& goto :eof
)
:START
cls
cd /d %~dp0

echo Вношу изменения в реестр - Making changes to the registry
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\EscapeFromTarkov" /f /v "InstallLocation" /t REG_SZ /d "%~dp0Install_EFT"

echo Запись в реестр добавила, создаю файлы - I added an entry to the registry, I create files
mkdir "%~dp0Install_EFT"  2>nul
mkdir "%~dp0Install_EFT\BattlEye"  2>nul

type nul > "%~dp0Install_EFT\BattlEye\BEClient_x64.dll"
type nul > "%~dp0Install_EFT\BattlEye\BEService_x64.exe"
type nul > "%~dp0Install_EFT\ConsistencyInfo"
type nul > "%~dp0Install_EFT\Uninstall.exe"
type nul > "%~dp0Install_EFT\UnityCrashHandler64.exe"

echo Файлы создала, можно играть - I have created files, you can play

del /f /q "%temp%\Elevating.vbs"

pause