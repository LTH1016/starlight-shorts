# 测试认证API的PowerShell脚本

Write-Host "=== 测试用户认证系统 ===" -ForegroundColor Green

# 1. 测试管理员登录
Write-Host "`n1. 管理员登录测试..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@drama-platform.com"
    password = "Admin123456"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $loginData = $loginResponse.Content | ConvertFrom-Json
    
    if ($loginData.success) {
        Write-Host "✓ 管理员登录成功" -ForegroundColor Green
        $adminToken = $loginData.data.accessToken
        Write-Host "访问令牌: $($adminToken.Substring(0, 20))..." -ForegroundColor Cyan
        
        # 2. 测试获取用户资料
        Write-Host "`n2. 获取用户资料测试..." -ForegroundColor Yellow
        $authHeaders = @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
        
        $profileResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/auth/profile" -Method Get -Headers $authHeaders
        $profileData = $profileResponse.Content | ConvertFrom-Json
        
        if ($profileData.success) {
            Write-Host "✓ 获取用户资料成功" -ForegroundColor Green
            Write-Host "用户名: $($profileData.data.username)" -ForegroundColor Cyan
            Write-Host "角色: $($profileData.data.role)" -ForegroundColor Cyan
        }
        
        # 3. 测试用户列表（管理员权限）
        Write-Host "`n3. 获取用户列表测试..." -ForegroundColor Yellow
        $usersResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/users" -Method Get -Headers $authHeaders
        $usersData = $usersResponse.Content | ConvertFrom-Json
        
        if ($usersData.success) {
            Write-Host "✓ 获取用户列表成功" -ForegroundColor Green
            Write-Host "用户总数: $($usersData.data.pagination.total)" -ForegroundColor Cyan
        }
        
        # 4. 测试用户统计
        Write-Host "`n4. 获取用户统计测试..." -ForegroundColor Yellow
        $statsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/v1/users/stats" -Method Get -Headers $authHeaders
        $statsData = $statsResponse.Content | ConvertFrom-Json
        
        if ($statsData.success) {
            Write-Host "✓ 获取用户统计成功" -ForegroundColor Green
            Write-Host "总用户数: $($statsData.data.totalUsers)" -ForegroundColor Cyan
            Write-Host "活跃用户数: $($statsData.data.activeUsers)" -ForegroundColor Cyan
        }
        
    } else {
        Write-Host "✗ 管理员登录失败: $($loginData.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 请求失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 认证测试完成 ===" -ForegroundColor Green
