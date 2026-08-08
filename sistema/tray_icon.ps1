Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Limpar processos antigos
Get-NetTCPConnection -LocalPort 3500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
Get-Process -Name "cpuminer*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Iniciar o Node.js em segundo plano
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:nodeProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"$dir`" && node server.js" -WindowStyle Hidden -PassThru

# Criar o Icone de Bandeja (Tray Icon)
$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
try {
    # Tenta carregar o icone do Bitcoin
    $iconPath = Join-Path $dir "public\bitcoin_hd.ico"
    if (Test-Path $iconPath) {
        $notifyIcon.Icon = New-Object System.Drawing.Icon($iconPath)
    } else {
        $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
    }
} catch {
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
}

$notifyIcon.Text = "Software BTC Lottery Miner (Rodando em Background)"
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

# Ação do Clique Duplo: Abrir Painel
$notifyIcon.add_DoubleClick({
    Start-Process "http://localhost:3500"
})

# Mostrar notificação balão na inicialização
$notifyIcon.ShowBalloonTip(3000, "Software BTC Miner", "O minerador está rodando de forma oculta. Dê dois cliques neste ícone para abrir o painel.", [System.Windows.Forms.ToolTipIcon]::Info)

# Aguarda o Node subri e abre o navegador automaticamente
Start-Sleep -Seconds 2
Start-Process "http://localhost:3500"

# Manter o script vivo sem janela visível
$appContext = New-Object System.Windows.Forms.ApplicationContext
[System.Windows.Forms.Application]::Run($appContext)
