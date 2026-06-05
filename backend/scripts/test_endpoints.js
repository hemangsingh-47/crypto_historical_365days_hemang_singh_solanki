// Verification script for Crypto Market Analytics API fixes
async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000';
  
  console.log('=== STARTING EXTENSIVE VERIFICATION SUITE ===');

  // Test cases details
  const tests = [
    {
      name: '1. Health check',
      path: '/',
      expectedStatus: 200
    },
    {
      name: '2. Array query parameters (Month array) - Crash Fix Verification',
      path: '/coins?month=2024-12&month=2024-12&limit=1',
      expectedStatus: 200
    },
    {
      name: '3. Array query parameters (Sort array) - Crash Fix Verification',
      path: '/coins?sort=price&sort=volume&limit=1',
      expectedStatus: 200
    },
    {
      name: '4. Array query parameters (Fields array) - Crash Fix Verification',
      path: '/coins?fields=coin_name&fields=price&limit=1',
      expectedStatus: 200
    },
    {
      name: '5. Regex injection in name search - Security Verification',
      path: '/coins/name/+',
      expectedStatus: 200
    },
    {
      name: '6. Invalid month format validation - getByMonth',
      path: '/coins/month/invalid-month',
      expectedStatus: 400
    },
    {
      name: '7. Invalid date format validation - getByDate',
      path: '/coins/date/invalid-date',
      expectedStatus: 400
    },
    {
      name: '8. Query param minPrice with non-numeric value - validation check',
      path: '/coins?minPrice=abc',
      expectedStatus: 400
    },
    {
      name: '9. Index utilization rank search - getByRank with integer',
      path: '/coins/rank/1?limit=1',
      expectedStatus: 200
    },
    {
      name: '10. Rank search with invalid rank - validation check',
      path: '/coins/rank/abc',
      expectedStatus: 400
    },
    {
      name: '11. Sort price-asc - Dedicated Sorting Endpoint',
      path: '/coins/sort/price-asc?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.coins && data.coins.length === 2) {
          return data.coins[0].price <= data.coins[1].price;
        }
        return true;
      }
    },
    {
      name: '12. Sort price-desc - Dedicated Sorting Endpoint',
      path: '/coins/sort/price-desc?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.coins && data.coins.length === 2) {
          return data.coins[0].price >= data.coins[1].price;
        }
        return true;
      }
    },
    {
      name: '13. Sort volume-desc - Dedicated Sorting Endpoint',
      path: '/coins/sort/volume-desc?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.coins && data.coins.length === 2) {
          return data.coins[0].volume >= data.coins[1].volume;
        }
        return true;
      }
    },
    {
      name: '14. Sort rank-asc - Dedicated Sorting Endpoint',
      path: '/coins/sort/rank-asc?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.coins && data.coins.length === 2) {
          return data.coins[0].market_cap_rank <= data.coins[1].market_cap_rank;
        }
        return true;
      }
    },
    {
      name: '15. Sort return-desc - Dedicated Sorting Endpoint',
      path: '/coins/sort/return-desc?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.coins && data.coins.length === 2) {
          // If daily_return is null on either, we skip direct comparison check
          if (data.coins[0].daily_return === null || data.coins[1].daily_return === null) return true;
          return data.coins[0].daily_return >= data.coins[1].daily_return;
        }
        return true;
      }
    },
    {
      name: '16. Name match - GET /search/coins?q=bitcoin',
      path: '/search/coins?q=bitcoin&limit=1',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins[0].coin_name.toLowerCase().includes('bitcoin');
      }
    },
    {
      name: '17. Symbol match - GET /search/coins?q=btc',
      path: '/search/coins?q=btc&limit=1',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins[0].symbol.toLowerCase().includes('btc');
      }
    },
    {
      name: '18. Month match - GET /search/coins?q=2024-12',
      path: '/search/coins?q=2024-12&limit=1',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins[0].month === '2024-12';
      }
    },
    {
      name: '19. Missing param check - GET /search/coins',
      path: '/search/coins',
      expectedStatus: 400
    },
    {
      name: '20. Regex injection check - GET /search/coins?q=%2B',
      path: '/search/coins?q=%2B',
      expectedStatus: 200
    },
    {
      name: '21. Filter high-price - GET /coins/filter/high-price',
      path: '/coins/filter/high-price?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins.every(c => c.price >= 100);
      }
    },
    {
      name: '22. Filter low-price - GET /coins/filter/low-price',
      path: '/coins/filter/low-price?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins.every(c => c.price < 1);
      }
    },
    {
      name: '23. Filter bullish - GET /coins/filter/bullish',
      path: '/coins/filter/bullish?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.every(c => c.price_ma7 > c.price_ma30);
      }
    },
    {
      name: '24. Filter bearish - GET /coins/filter/bearish',
      path: '/coins/filter/bearish?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.every(c => c.price_ma7 < c.price_ma30);
      }
    },
    {
      name: '25. Filter profitable - GET /coins/filter/profitable',
      path: '/coins/filter/profitable?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins.every(c => c.daily_return > 0);
      }
    },
    {
      name: '26. Filter loss-making - GET /coins/filter/loss-making',
      path: '/coins/filter/loss-making?limit=5',
      expectedStatus: 200,
      verify: (data) => {
        return data.coins && data.coins.length > 0 && data.coins.every(c => c.daily_return < 0);
      }
    },
    {
      name: '27. Filter invalid-filter - GET /coins/filter/invalid-filter',
      path: '/coins/filter/invalid-filter',
      expectedStatus: 400
    },
    {
      name: '28. Analytics summary - GET /coins/analytics/summary',
      path: '/coins/analytics/summary?limit=2',
      expectedStatus: 200,
      verify: (data) => {
        return data.analytics && data.analytics.length > 0 && typeof data.analytics[0].averagePrice === 'number';
      }
    },
    {
      name: '29. Analytics summary filtered - GET /coins/analytics/summary?month=2024-12',
      path: '/coins/analytics/summary?month=2024-12&limit=2',
      expectedStatus: 200,
      verify: (data) => {
        return data.analytics && data.analytics.length > 0;
      }
    },
    {
      name: '30. Analytics summary sorted - GET /coins/analytics/summary?sort=-averageVolume',
      path: '/coins/analytics/summary?sort=-averageVolume&limit=2',
      expectedStatus: 200,
      verify: (data) => {
        if (data.analytics && data.analytics.length === 2) {
          return data.analytics[0].averageVolume >= data.analytics[1].averageVolume;
        }
        return true;
      }
    },
    {
      name: '31. Analytics global - GET /coins/analytics/global',
      path: '/coins/analytics/global',
      expectedStatus: 200,
      verify: (data) => {
        return data.data && typeof data.data.totalMarketCap === 'number';
      }
    },
    {
      name: '32. Analytics price-distribution - GET /coins/analytics/price-distribution',
      path: '/coins/analytics/price-distribution',
      expectedStatus: 200,
      verify: (data) => {
        return Array.isArray(data.data) && data.data.length === 5 && typeof data.data[0].count === 'number';
      }
    },
    {
      name: '33. Analytics chronological summary - GET /coins/analytics/chronological-summary',
      path: '/coins/analytics/chronological-summary?interval=yearly',
      expectedStatus: 200,
      verify: (data) => {
        return Array.isArray(data.summary) && data.summary.length > 0 && typeof data.summary[0].averagePrice === 'number';
      }
    },
    {
      name: '34. Analytics chronological summary invalid - GET /coins/analytics/chronological-summary?interval=invalid',
      path: '/coins/analytics/chronological-summary?interval=invalid',
      expectedStatus: 400
    }
  ];

  for (const t of tests) {
    try {
      const res = await fetch(`${BASE_URL}${t.path}`);
      const data = await res.json();
      let customVerifyPassed = true;
      if (res.status === t.expectedStatus && t.verify) {
        customVerifyPassed = t.verify(data);
      }
      if (res.status === t.expectedStatus && customVerifyPassed) {
        console.log(`✅ [PASS] ${t.name}`);
        if (data.coins) {
          console.log(`          Coins returned: ${data.coins.length}`);
        }
      } else {
        console.log(`❌ [FAIL] ${t.name}`);
        console.log(`          Expected Status: ${t.expectedStatus}, Got: ${res.status}`);
        console.log(`          Custom verification passed: ${customVerifyPassed}`);
        console.log(`          Response:`, JSON.stringify(data).substring(0, 150));
      }
    } catch (err) {
      console.log(`❌ [ERROR] ${t.name}:`, err.message);
    }
  }

  // 11. Test PUT replacement vs PATCH update
  console.log('\n--- Testing PUT (Replacement) and PATCH (Partial Update) ---');
  try {
    // Let's get one coin from /coins to modify it
    const coinsRes = await fetch(`${BASE_URL}/coins?limit=1`);
    const coinsData = await coinsRes.json();
    if (!coinsData.coins || coinsData.coins.length === 0) {
      console.log('❌ Skipping PUT/PATCH tests: no coins found in DB.');
      return;
    }

    const testCoin = coinsData.coins[0];
    const coinId = testCoin._id;
    console.log(`Testing with Coin ID: ${coinId}`);

    // (a) Test PATCH: Update daily_return field
    const patchBody = { daily_return: 99.99 };
    const patchRes = await fetch(`${BASE_URL}/coins/${coinId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchBody)
    });
    const patchData = await patchRes.json();
    if (patchRes.status === 200 && patchData.data.daily_return === 99.99) {
      console.log('✅ [PASS] PATCH partial update succeeded');
    } else {
      console.log('❌ [FAIL] PATCH partial update failed:', patchRes.status, patchData);
    }

    // (b) Test PUT with missing fields (should fail with 400 Bad Request)
    const putMissingBody = { price: 50000 };
    const putMissingRes = await fetch(`${BASE_URL}/coins/${coinId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(putMissingBody)
    });
    const putMissingData = await putMissingRes.json();
    if (putMissingRes.status === 400) {
      console.log('✅ [PASS] PUT rejected missing fields (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] PUT accepted missing fields:', putMissingRes.status, putMissingData);
    }

    // (c) Test PUT with complete payload (should succeed)
    const completePutBody = {
      coin_id: testCoin.coin_id,
      coin_name: testCoin.coin_name,
      symbol: testCoin.symbol,
      market_cap_rank: testCoin.market_cap_rank,
      timestamp: testCoin.timestamp,
      date: testCoin.date,
      month: testCoin.month,
      price: 12345.67,
      market_cap: testCoin.market_cap,
      volume: testCoin.volume,
      daily_return: testCoin.daily_return,
      price_ma7: testCoin.price_ma7,
      price_ma30: testCoin.price_ma30,
      volatility_7d: testCoin.volatility_7d,
      cumulative_return: testCoin.cumulative_return
    };

    const putRes = await fetch(`${BASE_URL}/coins/${coinId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completePutBody)
    });
    const putData = await putRes.json();
    if (putRes.status === 200 && putData.data.price === 12345.67) {
      console.log('✅ [PASS] PUT complete replacement succeeded');
    } else {
      console.log('❌ [FAIL] PUT complete replacement failed:', putRes.status, putData);
    }

  } catch (err) {
    console.log('❌ [ERROR] PUT/PATCH tests threw error:', err.message);
  }

  // 12. Test Auth Registration and Verification
  console.log('\n--- Testing Authentication System (Register & Verify Email) ---');
  try {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    
    // (a) Register a new user
    const registerBody = {
      name: 'Test User',
      email: uniqueEmail,
      password: 'password123'
    };
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody)
    });
    const regData = await regRes.json();
    
    let token = '';
    if (regRes.status === 201 && regData.success) {
      console.log('✅ [PASS] POST /auth/register succeeded');
      token = regData.data.verificationToken;
    } else {
      console.log('❌ [FAIL] POST /auth/register failed:', regRes.status, regData);
    }

    // (b) Register duplicate user (should fail)
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerBody)
    });
    const dupData = await dupRes.json();
    if (dupRes.status === 400 && !dupData.success) {
      console.log('✅ [PASS] POST /auth/register duplicate email rejected (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] POST /auth/register duplicate email accepted:', dupRes.status, dupData);
    }

    // (c) Verify email with invalid token (should fail)
    const verifyInvalidRes = await fetch(`${BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'invalid_token_123' })
    });
    const verifyInvalidData = await verifyInvalidRes.json();
    if (verifyInvalidRes.status === 400 && !verifyInvalidData.success) {
      console.log('✅ [PASS] POST /auth/verify-email invalid token rejected (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] POST /auth/verify-email invalid token accepted:', verifyInvalidRes.status, verifyInvalidData);
    }

    // (d) Verify email with valid token (should succeed)
    if (token) {
      const verifyValidRes = await fetch(`${BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const verifyValidData = await verifyValidRes.json();
      if (verifyValidRes.status === 200 && verifyValidData.success) {
        console.log('✅ [PASS] POST /auth/verify-email valid token verified successfully');
      } else {
        console.log('❌ [FAIL] POST /auth/verify-email valid token verification failed:', verifyValidRes.status, verifyValidData);
      }
    } else {
      console.log('❌ Skipping valid token verification test: registration token was not retrieved.');
    }

    // (e) Login with incorrect credentials (should fail)
    const loginBadRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'wrongpassword' })
    });
    const loginBadData = await loginBadRes.json();
    if (loginBadRes.status === 400 && !loginBadData.success) {
      console.log('✅ [PASS] POST /auth/login bad credentials rejected (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] POST /auth/login bad credentials accepted:', loginBadRes.status, loginBadData);
    }

    // (f) Login with unverified account (should fail)
    const unverifiedEmail = `unverified_${Date.now()}@example.com`;
    const regUnvRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Unverified User', email: unverifiedEmail, password: 'password123' })
    });
    const regUnvData = await regUnvRes.json();
    if (regUnvRes.status === 201) {
      const loginUnvRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail, password: 'password123' })
      });
      const loginUnvData = await loginUnvRes.json();
      if (loginUnvRes.status === 400 && !loginUnvData.success && loginUnvData.message.includes('verify')) {
        console.log('✅ [PASS] POST /auth/login unverified account rejected (400 Bad Request)');
      } else {
        console.log('❌ [FAIL] POST /auth/login unverified account accepted:', loginUnvRes.status, loginUnvData);
      }
    } else {
      console.log('❌ Skipping unverified account login test: registration failed.');
    }

    // (g) Login with verified account (should succeed and return token)
    let loginToken = '';
    const loginGoodRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'password123' })
    });
    const loginGoodData = await loginGoodRes.json();
    if (loginGoodRes.status === 200 && loginGoodData.success && loginGoodData.token) {
      console.log('✅ [PASS] POST /auth/login verified credentials logged in successfully');
      loginToken = loginGoodData.token;
    } else {
      console.log('❌ [FAIL] POST /auth/login verified credentials failed:', loginGoodRes.status, loginGoodData);
    }

    // (h) Fetch profile without token (should fail)
    const profileNoTokenRes = await fetch(`${BASE_URL}/auth/profile`);
    const profileNoTokenData = await profileNoTokenRes.json();
    if (profileNoTokenRes.status === 401 && !profileNoTokenData.success) {
      console.log('✅ [PASS] GET /auth/profile without token rejected (401 Unauthorized)');
    } else {
      console.log('❌ [FAIL] GET /auth/profile without token accepted:', profileNoTokenRes.status, profileNoTokenData);
    }

    // (i) Fetch profile with valid token (should succeed)
    if (loginToken) {
      const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${loginToken}` }
      });
      const profileData = await profileRes.json();
      if (profileRes.status === 200 && profileData.success && profileData.data.email === uniqueEmail) {
        console.log('✅ [PASS] GET /auth/profile with valid Bearer token retrieved successfully');
      } else {
        console.log('❌ [FAIL] GET /auth/profile with valid token failed:', profileRes.status, profileData);
      }
    } else {
      console.log('❌ Skipping profile validation test: login token was not retrieved.');
    }

    // (j) Forgot password with invalid email (should fail)
    const forgotBadRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' })
    });
    const forgotBadData = await forgotBadRes.json();
    if (forgotBadRes.status === 400 && !forgotBadData.success) {
      console.log('✅ [PASS] POST /auth/forgot-password invalid email rejected (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] POST /auth/forgot-password invalid email accepted:', forgotBadRes.status, forgotBadData);
    }

    // (k) Forgot password with valid email (should succeed and return token)
    let resetToken = '';
    const forgotGoodRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail })
    });
    const forgotGoodData = await forgotGoodRes.json();
    if (forgotGoodRes.status === 200 && forgotGoodData.success && forgotGoodData.resetToken) {
      console.log('✅ [PASS] POST /auth/forgot-password valid email generated reset token successfully');
      resetToken = forgotGoodData.resetToken;
    } else {
      console.log('❌ [FAIL] POST /auth/forgot-password valid email failed:', forgotGoodRes.status, forgotGoodData);
    }

    // (l) Reset password with invalid token (should fail)
    const resetBadRes = await fetch(`${BASE_URL}/auth/reset-password/invalid_reset_token_123`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'newpassword123' })
    });
    const resetBadData = await resetBadRes.json();
    if (resetBadRes.status === 400 && !resetBadData.success) {
      console.log('✅ [PASS] POST /auth/reset-password invalid token rejected (400 Bad Request)');
    } else {
      console.log('❌ [FAIL] POST /auth/reset-password invalid token accepted:', resetBadRes.status, resetBadData);
    }

    // (m) Reset password with valid token (should succeed)
    if (resetToken) {
      const resetGoodRes = await fetch(`${BASE_URL}/auth/reset-password/${resetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'newpassword123' })
      });
      const resetGoodData = await resetGoodRes.json();
      if (resetGoodRes.status === 200 && resetGoodData.success) {
        console.log('✅ [PASS] POST /auth/reset-password valid token updated password successfully');
      } else {
        console.log('❌ [FAIL] POST /auth/reset-password valid token failed:', resetGoodRes.status, resetGoodData);
      }
    } else {
      console.log('❌ Skipping valid reset token test: reset token was not retrieved.');
    }

    // (n) Verify new password by logging in (should succeed)
    let newLoginToken = '';
    const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'newpassword123' })
    });
    const loginNewData = await loginNewRes.json();
    if (loginNewRes.status === 200 && loginNewData.success && loginNewData.token) {
      console.log('✅ [PASS] POST /auth/login with newly reset password succeeded');
      newLoginToken = loginNewData.token;
    } else {
      console.log('❌ [FAIL] POST /auth/login with newly reset password failed:', loginNewRes.status, loginNewData);
    }

    // (o) Change password without auth token (should fail)
    const changeNoAuthRes = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: 'newpassword123', newPassword: 'anotherpassword123' })
    });
    const changeNoAuthData = await changeNoAuthRes.json();
    if (changeNoAuthRes.status === 401 && !changeNoAuthData.success) {
      console.log('✅ [PASS] POST /auth/change-password without token rejected (401 Unauthorized)');
    } else {
      console.log('❌ [FAIL] POST /auth/change-password without token accepted:', changeNoAuthRes.status, changeNoAuthData);
    }

    // (p) Change password with incorrect current password (should fail)
    if (newLoginToken) {
      const changeBadRes = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newLoginToken}`
        },
        body: JSON.stringify({ currentPassword: 'wrong_password_here', newPassword: 'anotherpassword123' })
      });
      const changeBadData = await changeBadRes.json();
      if (changeBadRes.status === 400 && !changeBadData.success) {
        console.log('✅ [PASS] POST /auth/change-password wrong current password rejected (400 Bad Request)');
      } else {
        console.log('❌ [FAIL] POST /auth/change-password wrong current password accepted:', changeBadRes.status, changeBadData);
      }

      // (q) Change password with correct current password (should succeed)
      const changeGoodRes = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${newLoginToken}`
        },
        body: JSON.stringify({ currentPassword: 'newpassword123', newPassword: 'finalpassword123' })
      });
      const changeGoodData = await changeGoodRes.json();
      if (changeGoodRes.status === 200 && changeGoodData.success) {
        console.log('✅ [PASS] POST /auth/change-password correct credentials updated successfully');
      } else {
        console.log('❌ [FAIL] POST /auth/change-password correct credentials failed:', changeGoodRes.status, changeGoodData);
      }
    } else {
      console.log('❌ Skipping change password tests: new login token was not retrieved.');
    }

    // (r) Logout (should succeed)
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST'
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      console.log('✅ [PASS] POST /auth/logout succeeded');
    } else {
      console.log('❌ [FAIL] POST /auth/logout failed:', logoutRes.status, logoutData);
    }

    // (s) JWT Security & Token Refreshing (Phase 24)
    console.log('\n--- Testing JWT Security & Token Refreshing (Phase 24) ---');
    
    // 1. Login to get initial token and refresh token
    const phase24LoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: uniqueEmail, password: 'finalpassword123' })
    });
    const phase24LoginData = await phase24LoginRes.json();
    
    if (phase24LoginRes.status === 200 && phase24LoginData.success && phase24LoginData.token && phase24LoginData.refreshToken) {
      console.log('✅ [PASS] Phase 24 Login: retrieved access token and refresh token');
      const initialAccessToken = phase24LoginData.token;
      const initialRefreshToken = phase24LoginData.refreshToken;

      // 2. Refresh token with invalid token
      const invalidRefreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'invalid_refresh_token_123' })
      });
      const invalidRefreshData = await invalidRefreshRes.json();
      if (invalidRefreshRes.status === 401 && !invalidRefreshData.success) {
        console.log('✅ [PASS] POST /auth/refresh-token with invalid token rejected (401 Unauthorized)');
      } else {
        console.log('❌ [FAIL] POST /auth/refresh-token with invalid token was not rejected:', invalidRefreshRes.status, invalidRefreshData);
      }

      // 3. Refresh token with missing token
      const missingRefreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const missingRefreshData = await missingRefreshRes.json();
      if (missingRefreshRes.status === 400 && !missingRefreshData.success) {
        console.log('✅ [PASS] POST /auth/refresh-token with missing token rejected (400 Bad Request)');
      } else {
        console.log('❌ [FAIL] POST /auth/refresh-token with missing token was not rejected:', missingRefreshRes.status, missingRefreshData);
      }

      // 4. Refresh token with valid token (Rotation)
      const validRefreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: initialRefreshToken })
      });
      const validRefreshData = await validRefreshRes.json();
      let rotatedAccessToken = '';
      let rotatedRefreshToken = '';
      if (validRefreshRes.status === 200 && validRefreshData.success && validRefreshData.accessToken && validRefreshData.refreshToken) {
        console.log('✅ [PASS] POST /auth/refresh-token rotated successfully (returned new tokens)');
        rotatedAccessToken = validRefreshData.accessToken;
        rotatedRefreshToken = validRefreshData.refreshToken;
      } else {
        console.log('❌ [FAIL] POST /auth/refresh-token rotation failed:', validRefreshRes.status, validRefreshData);
      }

      // 5. Token Reuse Detection: attempt to reuse initialRefreshToken (which was already rotated)
      if (rotatedRefreshToken) {
        const reuseRefreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: initialRefreshToken })
        });
        const reuseRefreshData = await reuseRefreshRes.json();
        if (reuseRefreshRes.status === 401 && reuseRefreshData.message.includes('reuse')) {
          console.log('✅ [PASS] Token Reuse Detection triggered (401 and cleared sessions)');
        } else {
          console.log('❌ [FAIL] Token Reuse Detection did not trigger as expected:', reuseRefreshRes.status, reuseRefreshData);
        }

        // 6. Verify that the rotatedRefreshToken is also invalidated now because of reuse detection clearing all tokens
        const invalidatedRefreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rotatedRefreshToken })
        });
        const invalidatedRefreshData = await invalidatedRefreshRes.json();
        if (invalidatedRefreshRes.status === 401) {
          console.log('✅ [PASS] Rotated token is now invalid due to reuse detection sweep');
        } else {
          console.log('❌ [FAIL] Rotated token is still valid after reuse detection sweep:', invalidatedRefreshRes.status, invalidatedRefreshData);
        }
      }

      // 7. Login again to test Revocation
      const phase24LoginRes2 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: uniqueEmail, password: 'finalpassword123' })
      });
      const phase24LoginData2 = await phase24LoginRes2.json();
      if (phase24LoginRes2.status === 200 && phase24LoginData2.refreshToken) {
        const freshRefreshToken = phase24LoginData2.refreshToken;

        // 8. Revoke the token
        const revokeRes = await fetch(`${BASE_URL}/auth/revoke-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: freshRefreshToken })
        });
        const revokeData = await revokeRes.json();
        if (revokeRes.status === 200 && revokeData.success) {
          console.log('✅ [PASS] POST /auth/revoke-token revoked token successfully');
        } else {
          console.log('❌ [FAIL] POST /auth/revoke-token failed:', revokeRes.status, revokeData);
        }

        // 9. Try refreshing with the revoked token (should fail)
        const refreshRevokedRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: freshRefreshToken })
        });
        const refreshRevokedData = await refreshRevokedRes.json();
        if (refreshRevokedRes.status === 401) {
          console.log('✅ [PASS] Refreshing with revoked token rejected (401 Unauthorized)');
        } else {
          console.log('❌ [FAIL] Refreshing with revoked token accepted:', refreshRevokedRes.status, refreshRevokedData);
        }
      } else {
        console.log('❌ Skipping revocation tests: could not log in again');
      }

      // 10. Test logout with refresh token cleanup
      const phase24LoginRes3 = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: uniqueEmail, password: 'finalpassword123' })
      });
      const phase24LoginData3 = await phase24LoginRes3.json();
      if (phase24LoginRes3.status === 200 && phase24LoginData3.refreshToken) {
        const cleanupRefreshToken = phase24LoginData3.refreshToken;

        const logoutCleanupRes = await fetch(`${BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: cleanupRefreshToken })
        });
        const logoutCleanupData = await logoutCleanupRes.json();
        if (logoutCleanupRes.status === 200 && logoutCleanupData.success) {
          console.log('✅ [PASS] POST /auth/logout with refreshToken cleanup succeeded');
        } else {
          console.log('❌ [FAIL] POST /auth/logout with refreshToken cleanup failed:', logoutCleanupRes.status, logoutCleanupData);
        }

        // Verify the token is gone by trying to refresh it
        const refreshCleanupRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: cleanupRefreshToken })
        });
        if (refreshCleanupRes.status === 401) {
          console.log('✅ [PASS] Refresh with logged-out token rejected (401 Unauthorized)');
        } else {
          console.log('❌ [FAIL] Refresh with logged-out token accepted:', refreshCleanupRes.status);
        }
      } else {
        console.log('❌ Skipping logout cleanup test: could not log in again');
      }

    } else {
      console.log('❌ Skipping Phase 24 tests: login did not return correct token fields');
    }

    // (t) Custom Middlewares & Security Enhancements (Phase 25)
    console.log('\n--- Testing Custom Middlewares & Security Enhancements (Phase 25) ---');
    try {
      // 1. Check Rate Limiter Headers on a simple endpoint
      const rateLimitRes = await fetch(`${BASE_URL}/`);
      const limitHeader = rateLimitRes.headers.get('x-ratelimit-limit');
      const remainingHeader = rateLimitRes.headers.get('x-ratelimit-remaining');
      const resetHeader = rateLimitRes.headers.get('x-ratelimit-reset');

      if (limitHeader && remainingHeader && resetHeader) {
        console.log(`✅ [PASS] Rate Limit headers present (Limit: ${limitHeader}, Remaining: ${remainingHeader}, Reset: ${resetHeader})`);
      } else {
        console.log('❌ [FAIL] Rate Limit headers missing');
      }

      // 2. Check Rate Limiter quota decrement
      const res1 = await fetch(`${BASE_URL}/`);
      const rem1 = parseInt(res1.headers.get('x-ratelimit-remaining'), 10);
      const res2 = await fetch(`${BASE_URL}/`);
      const rem2 = parseInt(res2.headers.get('x-ratelimit-remaining'), 10);
      if (!isNaN(rem1) && !isNaN(rem2) && rem1 - rem2 === 1) {
        console.log('✅ [PASS] Rate Limiter decrements remaining quota correctly');
      } else {
        console.log(`❌ [FAIL] Rate Limiter quota decrement failed (Remaining 1: ${rem1}, Remaining 2: ${rem2})`);
      }

      // 3. Check CORS Options Preflight response
      const corsRes = await fetch(`${BASE_URL}/coins`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      const corsOrigin = corsRes.headers.get('access-control-allow-origin');
      const corsCredentials = corsRes.headers.get('access-control-allow-credentials');

      if (corsOrigin === 'http://localhost:3000' && corsCredentials === 'true') {
        console.log('✅ [PASS] Secure CORS configurations verified successfully');
      } else {
        console.log('❌ [FAIL] Secure CORS configuration check failed:', { corsOrigin, corsCredentials });
      }

    } catch (middlewareErr) {
      console.log('❌ [ERROR] Custom middleware tests failed:', middlewareErr.message);
    }

  } catch (err) {
    console.log('❌ [ERROR] Auth tests threw error:', err.message);
  }
}

runTests();
