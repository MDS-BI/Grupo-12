import * as storage from './storage.js';
import { ValidationError } from './storage.js';
import { DEFAULT_CLIENT_STATE } from './domain.js';
import { renderShell } from './components/shell.js';
import { renderDashboard } from './components/dashboard.js';
import { renderClientForm } from './components/client-form.js';
import { renderClientList } from './components/client-list.js';
import { renderClientDetail } from './components/client-detail.js';
import { renderEmployeeForm } from './components/employee-form.js';
import { renderEmployeeList } from './components/employee-list.js';
import { renderOpportunityForm } from './components/opportunity-form.js';
import { renderOpportunitiesView } from './components/opportunity-list.js';
import { renderInteractionForm } from './components/interaction-form.js';
import { renderInteractionsView } from './components/interaction-list.js';
import { renderSearch, renderSearchResults } from './components/search.js';
import { collectCustomFields, customFieldErrors } from './components/fields.js';

function byId(records, id) {
  return records.find((record) => record.id === id) ?? null;
}

function readFilters(form) {
  const data = new FormData(form);
  return {
    query: String(data.get('query') ?? ''),
    etapa: String(data.get('etapa') ?? ''),
    empleadoId: String(data.get('empleadoId') ?? ''),
    fechaDesde: String(data.get('fechaDesde') ?? ''),
    fechaHasta: String(data.get('fechaHasta') ?? '')
  };
}

export function createApp({ root, config, configErrors = [] }) {
  const state = {
    view: 'dashboard',
    editing: null,
    formErrors: [],
    formValues: null,
    selectedClientId: null,
    showArchivedClients: false,
    showArchivedEmployees: false,
    filters: { query: '', etapa: '', empleadoId: '', fechaDesde: '', fechaHasta: '' }
  };

  function applyTheme() {
    if (config?.theme?.accentColor) {
      document.documentElement.style.setProperty('--accent', config.theme.accentColor);
    }
  }

  function renderView(data) {
    const { clients, employees, opportunities, interactions } = data;
    const editing = state.editing;

    switch (state.view) {
      case 'dashboard':
        return renderDashboard({ metrics: storage.getDashboardMetrics(), config });

      case 'clients': {
        if (editing?.type === 'client') {
          const record = editing.id ? byId(clients, editing.id) : null;
          return renderClientForm({
            client: record,
            formValues: state.formValues,
            config,
            errors: state.formErrors
          });
        }
        if (state.selectedClientId) {
          return renderClientDetail({
            detail: storage.getClientDetail(state.selectedClientId),
            employees,
            config
          });
        }
        const visible = clients.filter((client) =>
          state.showArchivedClients ? client.archived : !client.archived
        );
        return renderClientList({
          clients: visible,
          config,
          showArchived: state.showArchivedClients
        });
      }

      case 'employees': {
        if (editing?.type === 'employee') {
          const record = editing.id ? byId(employees, editing.id) : null;
          return renderEmployeeForm({
            employee: record,
            formValues: state.formValues,
            config,
            errors: state.formErrors
          });
        }
        const visible = employees.filter((employee) =>
          state.showArchivedEmployees ? employee.archived : !employee.archived
        );
        return renderEmployeeList({
          employees: visible,
          config,
          showArchived: state.showArchivedEmployees
        });
      }

      case 'opportunities': {
        if (editing?.type === 'opportunity') {
          const record = editing.id ? byId(opportunities, editing.id) : null;
          return renderOpportunityForm({
            opportunity: record,
            formValues: state.formValues,
            clients: clients.filter((client) => !client.archived),
            employees: employees.filter((employee) => !employee.archived),
            config,
            errors: state.formErrors
          });
        }
        return renderOpportunitiesView({ opportunities, clients, employees, config });
      }

      case 'interactions': {
        if (editing?.type === 'interaction') {
          const record = editing.id ? byId(interactions, editing.id) : null;
          return renderInteractionForm({
            interaction: record,
            formValues: state.formValues,
            clients: clients.filter((client) => !client.archived),
            employees: employees.filter((employee) => !employee.archived),
            config,
            errors: state.formErrors
          });
        }
        return renderInteractionsView({ interactions, employees, config });
      }

      case 'search':
        return renderSearch({ clients, opportunities, employees, filters: state.filters, config });

      default:
        return renderDashboard({ metrics: storage.getDashboardMetrics(), config });
    }
  }

  function render() {
    const data = {
      clients: storage.loadClients(),
      employees: storage.loadEmployees(),
      opportunities: storage.loadOpportunities(),
      interactions: storage.loadInteractions()
    };
    const content = renderView(data);
    const notices = [
      ...configErrors.map((message) => ({ type: 'error', message })),
      ...storage.consumeStorageErrors().map((message) => ({ type: 'warning', message })),
      ...storage.checkReferentialIntegrity().map((message) => ({ type: 'warning', message }))
    ];
    root.innerHTML = renderShell({
      config,
      activeView: state.view,
      content,
      notices
    });
    applyTheme();
  }

  function resetFormState() {
    state.editing = null;
    state.formErrors = [];
    state.formValues = null;
  }

  function handleError(error, values) {
    if (error instanceof ValidationError) {
      state.formErrors = error.errors;
      state.formValues = values;
      render();
      return true;
    }
    return false;
  }

  function submitClient(form) {
    const data = new FormData(form);
    const values = {
      nombreEmpresa: String(data.get('nombreEmpresa') ?? ''),
      personaContacto: String(data.get('personaContacto') ?? ''),
      correo: String(data.get('correo') ?? ''),
      telefono: String(data.get('telefono') ?? ''),
      estado: String(data.get('estado') ?? DEFAULT_CLIENT_STATE),
      ...collectCustomFields(config, 'cliente', data)
    };
    const customErrors = customFieldErrors(config, 'cliente', values);
    if (customErrors.length) {
      state.formErrors = customErrors;
      state.formValues = values;
      render();
      return;
    }
    const id = String(data.get('id') ?? '');
    try {
      if (id) storage.updateClient(id, values);
      else storage.addClient(values);
      resetFormState();
      render();
    } catch (error) {
      if (!handleError(error, values)) throw error;
      state.formErrors = [...customErrors, ...state.formErrors];
      render();
    }
  }

  function submitEmployee(form) {
    const data = new FormData(form);
    const values = {
      nombre: String(data.get('nombre') ?? ''),
      cargo: String(data.get('cargo') ?? ''),
      ...collectCustomFields(config, 'empleado', data)
    };
    const customErrors = customFieldErrors(config, 'empleado', values);
    if (customErrors.length) {
      state.formErrors = customErrors;
      state.formValues = values;
      render();
      return;
    }
    const id = String(data.get('id') ?? '');
    try {
      if (id) storage.updateEmployee(id, values);
      else storage.addEmployee(values);
      resetFormState();
      render();
    } catch (error) {
      if (!handleError(error, values)) throw error;
      state.formErrors = [...customErrors, ...state.formErrors];
      render();
    }
  }

  function submitOpportunity(form) {
    const data = new FormData(form);
    const values = {
      clienteId: String(data.get('clienteId') ?? ''),
      empleadoId: String(data.get('empleadoId') ?? ''),
      descripcion: String(data.get('descripcion') ?? ''),
      montoEstimado: String(data.get('montoEstimado') ?? ''),
      fechaEstimadaCierre: String(data.get('fechaEstimadaCierre') ?? ''),
      ...collectCustomFields(config, 'oportunidad', data)
    };
    if (data.has('etapa')) values.etapa = String(data.get('etapa'));
    const customErrors = customFieldErrors(config, 'oportunidad', values);
    if (customErrors.length) {
      state.formErrors = customErrors;
      state.formValues = values;
      render();
      return;
    }
    const id = String(data.get('id') ?? '');
    try {
      if (id) {
        storage.updateOpportunity(id, values, {
          transitions: config.opportunityLifecycle.transitions
        });
      } else {
        storage.addOpportunity(values);
      }
      resetFormState();
      render();
    } catch (error) {
      if (!handleError(error, values)) throw error;
      state.formErrors = [...customErrors, ...state.formErrors];
      render();
    }
  }

  function submitInteraction(form) {
    const data = new FormData(form);
    const values = {
      clienteId: String(data.get('clienteId') ?? ''),
      empleadoId: String(data.get('empleadoId') ?? ''),
      fecha: String(data.get('fecha') ?? ''),
      tipo: String(data.get('tipo') ?? ''),
      descripcion: String(data.get('descripcion') ?? ''),
      ...collectCustomFields(config, 'interaccion', data)
    };
    const customErrors = customFieldErrors(config, 'interaccion', values);
    if (customErrors.length) {
      state.formErrors = customErrors;
      state.formValues = values;
      render();
      return;
    }
    const id = String(data.get('id') ?? '');
    try {
      if (id) storage.updateInteraction(id, values);
      else storage.addInteraction(values);
      resetFormState();
      render();
    } catch (error) {
      if (!handleError(error, values)) throw error;
      state.formErrors = [...customErrors, ...state.formErrors];
      render();
    }
  }

  function handleSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();

    switch (form.dataset.form) {
      case 'client':
        submitClient(form);
        break;
      case 'employee':
        submitEmployee(form);
        break;
      case 'opportunity':
        submitOpportunity(form);
        break;
      case 'interaction':
        submitInteraction(form);
        break;
      case 'search':
        state.filters = readFilters(form);
        updateSearchResults();
        break;
      default:
        break;
    }
  }

  function updateSearchResults() {
    const container = root.querySelector('#search-results');
    if (!container) return;
    container.innerHTML = renderSearchResults({
      clients: storage.loadClients(),
      opportunities: storage.loadOpportunities(),
      employees: storage.loadEmployees(),
      filters: state.filters,
      config
    });
  }

  function handleInput(event) {
    if (!event.target.matches('[data-search-field]')) return;
    const form = event.target.closest('form[data-form="search"]');
    if (!form) return;
    state.filters = readFilters(form);
    updateSearchResults();
  }

  function navigate(view) {
    state.view = view;
    state.selectedClientId = null;
    resetFormState();
    render();
  }

  function handleClick(event) {
    const navButton = event.target.closest('[data-nav]');
    if (navButton) {
      navigate(navButton.dataset.nav);
      return;
    }

    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    switch (action) {
      case 'new-client':
        state.view = 'clients';
        state.selectedClientId = null;
        state.editing = { type: 'client', id: null };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'edit-client':
        state.view = 'clients';
        state.selectedClientId = null;
        state.editing = { type: 'client', id };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'detail-client':
        state.view = 'clients';
        state.selectedClientId = id;
        resetFormState();
        break;
      case 'back-to-clients':
        state.selectedClientId = null;
        break;
      case 'archive-client':
        storage.archiveClient(id);
        render();
        return;
      case 'new-employee':
        state.view = 'employees';
        state.editing = { type: 'employee', id: null };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'edit-employee':
        state.view = 'employees';
        state.editing = { type: 'employee', id };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'archive-employee':
        storage.archiveEmployee(id);
        render();
        return;
      case 'new-opportunity':
        state.view = 'opportunities';
        state.editing = { type: 'opportunity', id: null };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'edit-opportunity':
        state.view = 'opportunities';
        state.editing = { type: 'opportunity', id };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'delete-opportunity':
        storage.deleteOpportunity(id);
        render();
        return;
      case 'new-interaction':
        state.view = 'interactions';
        state.editing = { type: 'interaction', id: null };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'edit-interaction':
        state.view = 'interactions';
        state.editing = { type: 'interaction', id };
        state.formErrors = [];
        state.formValues = null;
        break;
      case 'delete-interaction':
        storage.deleteInteraction(id);
        render();
        return;
      case 'toggle-archived':
        if (state.view === 'employees') {
          state.showArchivedEmployees = !state.showArchivedEmployees;
        } else {
          state.showArchivedClients = !state.showArchivedClients;
        }
        break;
      case 'nav-clients':
        state.view = 'clients';
        state.selectedClientId = null;
        resetFormState();
        break;
      case 'cancel-form':
        resetFormState();
        break;
      default:
        return;
    }
    render();
  }

  function start() {
    root.addEventListener('click', handleClick);
    root.addEventListener('submit', handleSubmit);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleInput);
    render();
  }

  return { state, render, start };
}

export function initApp(options) {
  const app = createApp(options);
  app.start();
  return app;
}
