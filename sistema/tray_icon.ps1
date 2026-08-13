Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Limpar processos anteriores caso existam
Get-NetTCPConnection -LocalPort 3500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Get-Process -Name "cpuminer*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Iniciar o Node.js em segundo plano
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:nodeProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"$dir`" && node server.js" -WindowStyle Hidden -PassThru

# Criar o Icone de Bandeja (Tray Icon)
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
try {
    $iconPath = Join-Path $dir "public\bitcoin_hd.ico"
    if (Test-Path $iconPath) {
        $notifyIcon.Icon = New-Object System.Drawing.Icon($iconPath)
    } else {
        $notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
    }
} catch {
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Application
}

$notifyIcon.Text = "Software BTC Lottery Miner"
$notifyIcon.Visible = $true

# Menu de contexto (Clique direito)
$menu = New-Object System.Windows.Forms.ContextMenu

$openItem = New-Object System.Windows.Forms.MenuItem
$openItem.Text = "Abrir Painel"
$openItem.add_Click({ Start-Process "http://localhost:3500" })

$exitItem = New-Object System.Windows.Forms.MenuItem
$exitItem.Text = "Desligar Minerador e Sair"
$exitItem.add_Click({
    $notifyIcon.Visible = $false
    # Matar processos
    Get-NetTCPConnection -LocalPort 3500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Get-Process -Name "cpuminer*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    if ($script:nodeProcess -and !$script:nodeProcess.HasExited) {
        Stop-Process -Id $script:nodeProcess.Id -Force -ErrorAction SilentlyContinue
    }
    [System.Windows.Forms.Application]::Exit()
})

$menu.MenuItems.Add($openItem)
$menu.MenuItems.Add($exitItem)
$notifyIcon.ContextMenu = $menu

# Ação de clique duplo: Abrir painel
$notifyIcon.add_DoubleClick({
    Start-Process "http://localhost:3500"
})

# Notificação balão inicial
try {
    $notifyIcon.ShowBalloonTip(3000, "Software BTC Miner", "O minerador esta rodando de forma oculta. De dois cliques neste icone para abrir o painel.", [System.Windows.Forms.ToolTipIcon]::Info)
} catch {}

# Aguardar 1.5s para o servidor Node subir e abrir navegador
Start-Sleep -Milliseconds 1500
Start-Process "http://localhost:3500"

# Manter o processo do icone vivo
$appContext = New-Object System.Windows.Forms.ApplicationContext
[System.Windows.Forms.Application]::Run($appContext)
