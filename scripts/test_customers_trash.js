(async () => {
  const base = 'http://localhost:3000';
  function log(title, obj) { console.log('\n== ' + title + ' =='); if (obj !== undefined) console.log(JSON.stringify(obj, null, 2)); }
  try {
    // Create customer
    const createResp = await fetch(base + '/api/customers', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Test Khach', phone: '0123456789', depositAmount: 1000000, commission: 10 })
    });
    const created = await createResp.json();
    log('created', created);

    const id = created?.id;
    if (!id) throw new Error('Create failed');

    // Ensure it's in active list
    const activeBefore = await (await fetch(base + '/api/customers')).json();
    log('activeBefore length', activeBefore.length);

    // Ensure trash empty for this id
    const trashBefore = await (await fetch(base + '/api/customers?deleted=true')).json();
    log('trashBefore contains id', trashBefore.find && trashBefore.find(c => String(c.id) === String(id)) ? true : false);

    // Soft-delete
    const delResp = await fetch(base + '/api/customers', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    const delResJson = await delResp.json().catch(() => ({ ok: delResp.ok }));
    log('delete response', delResJson);

    // Check active and trash after
    const activeAfter = await (await fetch(base + '/api/customers')).json();
    log('activeAfter contains id', activeAfter.find && activeAfter.find(c => String(c.id) === String(id)) ? true : false);
    const trashAfter = await (await fetch(base + '/api/customers?deleted=true')).json();
    log('trashAfter contains id', trashAfter.find && trashAfter.find(c => String(c.id) === String(id)) ? true : false);

    // Restore
    const putResp = await fetch(base + '/api/customers', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, deleted: false }) });
    const putJson = await putResp.json();
    log('restore response', putJson);

    const activeRestored = await (await fetch(base + '/api/customers')).json();
    log('activeRestored contains id', activeRestored.find && activeRestored.find(c => String(c.id) === String(id)) ? true : false);

    // Soft-delete again then permanently delete
    await fetch(base + '/api/customers', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
    const permDelResp = await fetch(base + '/api/customers', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, permanent: true }) });
    const permDelJson = await permDelResp.json().catch(() => ({ ok: permDelResp.ok }));
    log('permanent delete response', permDelJson);

    const finalActive = await (await fetch(base + '/api/customers')).json();
    log('finalActive contains id', finalActive.find && finalActive.find(c => String(c.id) === String(id)) ? true : false);
    const finalTrash = await (await fetch(base + '/api/customers?deleted=true')).json();
    log('finalTrash contains id', finalTrash.find && finalTrash.find(c => String(c.id) === String(id)) ? true : false);

    console.log('\nAll done');
  } catch (err) {
    console.error('Test script error', err);
    process.exit(1);
  }
})();
