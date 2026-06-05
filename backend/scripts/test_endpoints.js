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

    // (j) Logout (should succeed)
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST'
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      console.log('✅ [PASS] POST /auth/logout succeeded');
    } else {
      console.log('❌ [FAIL] POST /auth/logout failed:', logoutRes.status, logoutData);
    }

  } catch (err) {
    console.log('❌ [ERROR] Auth tests threw error:', err.message);
  }
}

runTests();
