// Frontend Session Test Script
// Run this in the browser console to test session handling

console.log('🔍 Frontend Session Test Starting...\n');

class FrontendSessionTester {
  constructor() {
    this.testResults = [];
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
    this.sessionCookie = null;
  }

  // Test 1: Check current cookies and session state
  async testCurrentSessionState() {
    console.log('🧪 Test 1: Checking current session state...');
    
    const currentCookies = document.cookie;
    const sessionCookie = this.extractSessionCookie(currentCookies);
    
    const result = {
      test: 'Current Session State',
      timestamp: new Date().toISOString(),
      hasCookies: !!currentCookies,
      cookieCount: currentCookies ? currentCookies.split(';').length : 0,
      sessionCookie: sessionCookie ? sessionCookie.substring(0, 20) + '...' : 'none',
      currentUrl: window.location.href,
      backendUrl: this.backendUrl
    };
    
    console.log('✅ Current session state:', result);
    this.testResults.push(result);
    return result;
  }

  // Test 2: Test backend connectivity
  async testBackendConnectivity() {
    console.log('\n🧪 Test 2: Testing backend connectivity...');
    
    try {
      const response = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = {
        test: 'Backend Connectivity',
        timestamp: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        backendUrl: this.backendUrl,
        hasCredentials: true
      };
      
      console.log('✅ Backend connectivity test:', result);
      this.testResults.push(result);
      return result;
    } catch (error) {
      const result = {
        test: 'Backend Connectivity',
        timestamp: new Date().toISOString(),
        error: error.message,
        backendUrl: this.backendUrl,
        hasCredentials: true
      };
      
      console.error('❌ Backend connectivity test failed:', result);
      this.testResults.push(result);
      return result;
    }
  }

  // Test 3: Test session creation
  async testSessionCreation() {
    console.log('\n🧪 Test 3: Testing session creation...');
    
    try {
      const response = await fetch(`${this.backendUrl}/test-session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      const setCookieHeader = response.headers.get('set-cookie');
      
      const result = {
        test: 'Session Creation',
        timestamp: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        sessionID: data.sessionID,
        views: data.views,
        hasSetCookie: !!setCookieHeader,
        setCookieHeader: setCookieHeader ? setCookieHeader.substring(0, 50) + '...' : 'none',
        cookieSecure: data.cookieSecure,
        cookieSameSite: data.cookieSameSite
      };
      
      // Store session cookie for next test
      if (setCookieHeader) {
        this.sessionCookie = setCookieHeader;
      }
      
      console.log('✅ Session creation test:', result);
      this.testResults.push(result);
      return result;
    } catch (error) {
      const result = {
        test: 'Session Creation',
        timestamp: new Date().toISOString(),
        error: error.message,
        backendUrl: this.backendUrl
      };
      
      console.error('❌ Session creation test failed:', result);
      this.testResults.push(result);
      return result;
    }
  }

  // Test 4: Test session persistence
  async testSessionPersistence() {
    console.log('\n🧪 Test 4: Testing session persistence...');
    
    if (!this.sessionCookie) {
      console.log('⚠️ No session cookie available, skipping persistence test');
      return null;
    }
    
    try {
      const response = await fetch(`${this.backendUrl}/test-session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.sessionCookie
        }
      });
      
      const data = await response.json();
      
      const result = {
        test: 'Session Persistence',
        timestamp: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        sessionID: data.sessionID,
        views: data.views,
        testValue: data.testValue,
        sessionData: data.sessionData,
        hasSessionCookie: !!this.sessionCookie
      };
      
      console.log('✅ Session persistence test:', result);
      this.testResults.push(result);
      return result;
    } catch (error) {
      const result = {
        test: 'Session Persistence',
        timestamp: new Date().toISOString(),
        error: error.message,
        hasSessionCookie: !!this.sessionCookie
      };
      
      console.error('❌ Session persistence test failed:', result);
      this.testResults.push(result);
      return result;
    }
  }

  // Test 5: Test login endpoint
  async testLoginEndpoint() {
    console.log('\n🧪 Test 5: Testing login endpoint...');
    
    try {
      const response = await fetch(`${this.backendUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'test@example.com',
          password: 'testpassword'
        })
      });
      
      const data = await response.json();
      const setCookieHeader = response.headers.get('set-cookie');
      
      const result = {
        test: 'Login Endpoint',
        timestamp: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        hasSetCookie: !!setCookieHeader,
        setCookieHeader: setCookieHeader ? setCookieHeader.substring(0, 50) + '...' : 'none',
        responseData: data,
        expectedError: response.status === 401 ? 'Expected for invalid credentials' : 'Unexpected status'
      };
      
      console.log('✅ Login endpoint test:', result);
      this.testResults.push(result);
      return result;
    } catch (error) {
      const result = {
        test: 'Login Endpoint',
        timestamp: new Date().toISOString(),
        error: error.message
      };
      
      console.error('❌ Login endpoint test failed:', result);
      this.testResults.push(result);
      return result;
    }
  }

  // Test 6: Test CORS and credentials
  async testCORSAndCredentials() {
    console.log('\n🧪 Test 6: Testing CORS and credentials...');
    
    try {
      const response = await fetch(`${this.backendUrl}/debug-auth`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      const result = {
        test: 'CORS and Credentials',
        timestamp: new Date().toISOString(),
        status: response.status,
        ok: response.ok,
        hasCredentials: true,
        sessionID: data.sessionID,
        isAuthenticated: data.isAuthenticated,
        hasUser: data.hasUser,
        hasSession: data.hasSession,
        cookies: data.cookies
      };
      
      console.log('✅ CORS and credentials test:', result);
      this.testResults.push(result);
      return result;
    } catch (error) {
      const result = {
        test: 'CORS and Credentials',
        timestamp: new Date().toISOString(),
        error: error.message
      };
      
      console.error('❌ CORS and credentials test failed:', result);
      this.testResults.push(result);
      return result;
    }
  }

  // Extract session cookie from cookie string
  extractSessionCookie(cookieString) {
    const match = cookieString.match(/easyearn\.sid=([^;]+)/);
    return match ? match[1] : null;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive frontend session tests...\n');
    
    await this.testCurrentSessionState();
    await this.testBackendConnectivity();
    await this.testSessionCreation();
    await this.testSessionPersistence();
    await this.testLoginEndpoint();
    await this.testCORSAndCredentials();
    
    this.generateTestReport();
  }

  // Generate comprehensive test report
  generateTestReport() {
    console.log('\n📊 FRONTEND SESSION TEST REPORT');
    console.log('================================');
    
    const summary = {
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter(r => r.ok !== false && !r.error).length,
      failedTests: this.testResults.filter(r => r.ok === false || r.error).length,
      timestamp: new Date().toISOString(),
      backendUrl: this.backendUrl,
      frontendUrl: window.location.href
    };
    
    console.log('Summary:', summary);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.ok !== false && !result.error ? '✅ PASS' : '❌ FAIL';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Identify specific issues
    this.identifyIssues();
    
    return summary;
  }

  // Identify specific issues
  identifyIssues() {
    console.log('\n🔍 ISSUE ANALYSIS:');
    
    const backendConnectivity = this.testResults.find(r => r.test === 'Backend Connectivity');
    if (backendConnectivity?.error) {
      console.log('❌ ISSUE: Backend connectivity failed');
      console.log('   - Check if backend server is running');
      console.log('   - Verify backend URL:', this.backendUrl);
      console.log('   - Check network/firewall settings');
    }
    
    const sessionCreation = this.testResults.find(r => r.test === 'Session Creation');
    if (sessionCreation?.error) {
      console.log('❌ ISSUE: Session creation failed');
      console.log('   - Backend session endpoints may be down');
      console.log('   - Check backend logs for errors');
    }
    
    const sessionPersistence = this.testResults.find(r => r.test === 'Session Persistence');
    if (sessionPersistence?.error) {
      console.log('❌ ISSUE: Session persistence failed');
      console.log('   - Cookies may not be properly set');
      console.log('   - Session store may have issues');
    }
    
    const corsTest = this.testResults.find(r => r.test === 'CORS and Credentials');
    if (corsTest?.error) {
      console.log('❌ ISSUE: CORS/credentials failed');
      console.log('   - CORS configuration mismatch');
      console.log('   - Credentials not being sent properly');
    }
    
    // Check for cookie issues
    const hasCookies = this.testResults.some(r => r.hasCookies || r.hasSetCookie);
    if (!hasCookies) {
      console.log('❌ ISSUE: No cookies being set/received');
      console.log('   - Check backend cookie configuration');
      console.log('   - Verify domain/port matching');
      console.log('   - Check browser cookie settings');
    }
  }
}

// Create and run the tester
const sessionTester = new FrontendSessionTester();

// Export for manual testing
window.sessionTester = sessionTester;

console.log('🎯 Session tester ready! Run: sessionTester.runAllTests()');
console.log('Or run individual tests:');
console.log('- sessionTester.testCurrentSessionState()');
console.log('- sessionTester.testBackendConnectivity()');
console.log('- sessionTester.testSessionCreation()');
console.log('- sessionTester.testSessionPersistence()');
console.log('- sessionTester.testLoginEndpoint()');
console.log('- sessionTester.testCORSAndCredentials()');
