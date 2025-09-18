// Simple Frontend Session Test
console.log('🔍 Frontend Session Test Starting...');

// Test 1: Check current cookies
function checkCurrentCookies() {
  console.log('🧪 Test 1: Checking current cookies...');
  const cookies = document.cookie;
  const sessionCookie = cookies.match(/easyearn\.sid=([^;]+)/);
  
  console.log('Current cookies:', cookies);
  console.log('Session cookie:', sessionCookie ? sessionCookie[1].substring(0, 20) + '...' : 'none');
  
  return {
    hasCookies: !!cookies,
    sessionCookie: sessionCookie ? sessionCookie[1] : null
  };
}

// Test 2: Test backend connectivity
async function testBackendConnectivity() {
  console.log('\n🧪 Test 2: Testing backend connectivity...');
  
  try {
    const response = await fetch('http://localhost:3005/health', {
      method: 'GET',
      credentials: 'include'
    });
    
    console.log('✅ Backend connected, status:', response.status);
    return { ok: true, status: response.status };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return { ok: false, error: error.message };
  }
}

// Test 3: Test session creation
async function testSessionCreation() {
  console.log('\n🧪 Test 3: Testing session creation...');
  
  try {
    const response = await fetch('http://localhost:3005/test-session', {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    const setCookie = response.headers.get('set-cookie');
    
    console.log('✅ Session created:', {
      sessionID: data.sessionID,
      views: data.views,
      hasSetCookie: !!setCookie
    });
    
    return { ok: true, data, setCookie };
  } catch (error) {
    console.error('❌ Session creation failed:', error.message);
    return { ok: false, error: error.message };
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running frontend session tests...\n');
  
  const cookies = checkCurrentCookies();
  const connectivity = await testBackendConnectivity();
  const session = await testSessionCreation();
  
  console.log('\n📊 Test Results:');
  console.log('Cookies:', cookies);
  console.log('Connectivity:', connectivity);
  console.log('Session:', session);
  
  return { cookies, connectivity, session };
}

// Export for use
window.runFrontendSessionTests = runAllTests;
console.log('🎯 Run tests with: runFrontendSessionTests()');
