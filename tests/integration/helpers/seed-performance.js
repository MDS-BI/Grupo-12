/**
 * Deterministic seed for SC-005 / FR-014 performance tests.
 * Keys UI (contracts/storage.md): crm.gaps002.ui.employeesView, crm.gaps002.ui.clients360,
 * crm.gaps002.ui.archivedFilter.entities, crm.gaps002.ui.archivedFilter.employees
 */
export function seedPerformanceDataset({
  customers = 500,
  opportunitiesPerCustomer = 1,
  interactionsPerCustomer = 1
} = {}) {
  const cust = [];
  const emps = [];
  const opps = [];
  const ints = [];
  for (let i = 1; i <= 10; i += 1) {
    emps.push({
      id: `emp-perf-${i}`,
      name: `Empleado ${i}`,
      role: i % 2 === 0 ? 'Ejecutivo' : 'Analista',
      archived: false,
      createdAt: '2026-01-01T00:00:00.000Z'
    });
  }
  for (let i = 1; i <= customers; i += 1) {
    const id = `cust-perf-${i}`;
    cust.push({
      id,
      companyName: `Cliente ${String(i).padStart(3, '0')}`,
      contactName: `Contacto ${i}`,
      email: `cliente${i}@example.com`,
      phone: `+5690000${String(i).padStart(4, '0')}`,
      status: i % 3 === 0 ? 'Inactivo' : 'Activo',
      archived: false,
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    for (let j = 0; j < opportunitiesPerCustomer; j += 1) {
      opps.push({
        id: `opp-perf-${i}-${j}`,
        clientId: id,
        employeeId: `emp-perf-${((i + j) % 10) + 1}`,
        amount: 1000 + i,
        closeDate: `2026-${String(((i % 12) + 1)).padStart(2, '0')}-15`,
        stage: i % 2 === 0 ? 'Propuesta' : 'Evaluación',
        archived: false,
        createdAt: '2026-01-01T00:00:00.000Z'
      });
    }
    for (let k = 0; k < interactionsPerCustomer; k += 1) {
      ints.push({
        id: `int-perf-${i}-${k}`,
        clientId: id,
        employeeId: `emp-perf-${((i + k) % 10) + 1}`,
        date: '2026-11-01',
        type: ['Llamada', 'Correo', 'Reunión'][i % 3],
        description: `Nota interacción ${i}-${k}`,
        archived: false,
        createdAt: '2026-01-01T00:00:00.000Z'
      });
    }
  }
  localStorage.setItem('crm_customers', JSON.stringify(cust));
  localStorage.setItem('crm_employees', JSON.stringify(emps));
  localStorage.setItem('crm_opportunities', JSON.stringify(opps));
  localStorage.setItem('crm_interactions', JSON.stringify(ints));
  return { customers: cust, employees: emps, opportunities: opps, interactions: ints };
}
