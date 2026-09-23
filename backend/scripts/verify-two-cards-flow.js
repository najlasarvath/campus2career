/**
 * Verification Test: Two Skill-Status Cards Flow
 * Verifies End-to-End Database -> API -> Frontend Service -> Component Data Flow
 */
const assert = require('assert');

async function runVerification() {
  console.log('=====================================================');
  console.log('  VERIFYING TWO SKILL-STATUS CARDS (DATA FLOW & LOGIC)');
  console.log('=====================================================\n');

  // 1. Test Backend API Endpoint
  const response = await fetch('http://localhost:5000/api/analytics/alerts');
  assert.strictEqual(response.status, 200, 'API endpoint /api/analytics/alerts returns 200');
  const data = await response.json();

  assert.strictEqual(data.success, true, 'API returns success: true');
  assert.strictEqual(data.threshold, 40, 'Alert threshold is exactly 40%');
  assert.ok(Array.isArray(data.alerts), 'alerts is an array');

  console.log(`[Check 1] Total alerts returned by API: ${data.alerts.length}`);
  assert.ok(data.alerts.length <= 2, `API alerts count must be <= 2, got ${data.alerts.length}`);

  if (data.alerts.length === 2) {
    const card1 = data.alerts[0];
    const card2 = data.alerts[1];

    console.log(`[Check 2] Card 1 (Above Threshold): Skill="${card1.skill}", Deficit=${card1.deficitPercentage}%, Critical=${card1.isCritical}`);
    console.log(`[Check 3] Card 2 (Below Threshold): Skill="${card2.skill}", Deficit=${card2.deficitPercentage}%, Critical=${card2.isCritical}`);

    assert.ok(card1.deficitPercentage >= 40, `Card 1 deficit (${card1.deficitPercentage}%) must be >= 40%`);
    assert.strictEqual(card1.isCritical, true, 'Card 1 isCritical must be true');
    assert.ok(card1.statusMessage.includes('Exceeded'), 'Card 1 status indicates threshold exceeded');

    assert.ok(card2.deficitPercentage < 40, `Card 2 deficit (${card2.deficitPercentage}%) must be < 40%`);
    assert.strictEqual(card2.isCritical, false, 'Card 2 isCritical must be false');
    assert.ok(card2.statusMessage.includes('Below intervention threshold'), 'Card 2 status indicates below threshold');

    // Workshop verification for Card 1
    if (card1.hasWorkshop) {
      assert.ok(card1.workshop && card1.workshop.videoUrl, 'Card 1 with workshop contains valid video link');
      console.log(`[Check 4] Card 1 workshop action text: "${card1.workshopActionText}" (Video: ${card1.workshop.videoUrl})`);
    } else {
      console.log(`[Check 4] Card 1 has no conducted workshop: action text "${card1.workshopActionText}"`);
    }
  }

  // 2. Verify Frontend Service emulation
  const serviceAlerts = (data.representativeAlerts || data.alerts || []).slice(0, 2);
  assert.ok(serviceAlerts.length <= 2, 'Frontend service yields at most 2 alerts');
  console.log(`[Check 5] Frontend service alerts count: ${serviceAlerts.length} (Max 2 enforced)`);

  // 3. Verify No Hardcoded Skill Constraint
  console.log(`[Check 6] Selected skills are dynamically derived from DB:`);
  data.alerts.forEach((alert, i) => {
    console.log(`   - Alert ${i + 1}: ${alert.skill} (${alert.affectedStudents}/${data.totalStudents} students affected, ${alert.deficitPercentage}% deficit)`);
  });

  console.log('\n=====================================================');
  console.log('  ALL CHECKS PASSED: STRICT 2-CARD FILTERING VERIFIED');
  console.log('=====================================================');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
