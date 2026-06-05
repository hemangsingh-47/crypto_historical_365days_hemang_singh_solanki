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
}

runTests();
