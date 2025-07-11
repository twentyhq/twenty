const axios = require('axios');

// Test script cho Super Admin Impersonation
async function testImpersonation() {
  console.log('🚀 Testing Super Admin Impersonation Feature');
  console.log('=========================================');
  
  // Configuration
  const baseURL = 'http://localhost:3000';
  const testWorkspaceId = 'test-workspace-id'; // Thay đổi thành workspace ID thực tế
  
  try {
    // Bước 1: Đăng nhập với Super Admin (cần có tài khoản Super Admin)
    console.log('1. Đăng nhập với Super Admin...');
    // Giả định bạn đã có access token của Super Admin
    const adminToken = 'your-super-admin-token-here';
    
    if (adminToken === 'your-super-admin-token-here') {
      console.log('❌ Vui lòng cập nhật adminToken trong script');
      console.log('   Bạn cần:');
      console.log('   - Tạo tài khoản Super Admin trong database');
      console.log('   - Đặt canAccessFullAdminPanel = true');
      console.log('   - Đăng nhập và lấy token');
      return;
    }
    
    // Bước 2: Gọi API impersonate
    console.log('2. Gọi API impersonate...');
    const impersonateResponse = await axios.post(
      `${baseURL}/rest/admin/workspaces/${testWorkspaceId}/impersonate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Impersonation token tạo thành công!');
    console.log('Token:', impersonateResponse.data.token);
    console.log('Expires at:', impersonateResponse.data.expiresAt);
    
    // Bước 3: Test token impersonation
    console.log('3. Test token impersonation...');
    const impersonationToken = impersonateResponse.data.token;
    
    // Thử truy cập một API của workspace bằng token impersonation
    const testAPIResponse = await axios.get(
      `${baseURL}/rest/objects/people`, // Hoặc endpoint khác
      {
        headers: {
          'Authorization': `Bearer ${impersonationToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Truy cập workspace thành công với token impersonation!');
    console.log('Response status:', testAPIResponse.status);
    
  } catch (error) {
    console.error('❌ Lỗi khi test impersonation:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Chạy test
testImpersonation();