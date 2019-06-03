// Import jQuery, which will also expose $ on the global `window` Object.
import $ from './jquery-es';
// After jQuery is loaded, we can load the Bootstrap JS, which depends on jQuery.
import 'bootstrap';

// Place your imports for Moment.js and Lodash here...

import moment from 'moment';
import _ from 'lodash';

// The rest of your code can go here.  You're also welcome to split
// your code up into multiple files using ES modules and import/export.

let employeesModel = [];

$(document).ready(function() {
  initializeEmployeesModel();

  //search field that filters based on entered string
  $('#employee-search').on('keyup', function() {
    let search = getFilteredEmployeesModel(this.value);
    refreshEmployeeRows(search);
  });

  //when an employee row is clicked
  $(document).on('click', '.body-row', function() {
    let employee = getEmployeeModelById($(this).attr('data-id'));

    if (employee !== null) {
      employee.HireDate = moment(employee.HireDate).format('LL');

      //provides formatted modal window content
      let modalTemplate = _.template(
        '<strong>Address:</strong> <%- employee.AddressStreet %> <%- employee.AddressCity %>, <%- employee.AddressState %>. <%- employee.AddressZip %></br>' +
          '<strong>Phone Number:</strong> <%- employee.PhoneNum %> ext: <%- employee.Extension %></br>' +
          '<strong>Hire Date:</strong> <%- employee.HireDate %>'
      );

      let modalContent = modalTemplate({ employee: employee });

      //display id title and content
      showGenericModal(employee.FirstName + ' ' + employee.LastName, modalContent);
    }
  });
});

//populates the employeesModel array, calls teams-api from heroku
function initializeEmployeesModel() {
  $.ajax({
    url: 'https://morning-tor-21032.herokuapp.com/employees',
    type: 'GET',
    contentType: 'application/json'
  })
    .done(function(data) {
      console.log('SUCCESS');
      employeesModel = data;
      refreshEmployeeRows(employeesModel);
    })
    .fail(function() {
      console.log('FAILED');
      showGenericModal('Error', 'Unable to get Employees');
    });
}

// generic modal window with employee info
function showGenericModal(title, message) {
  $('.modal-title').html(title);
  $('.modal-body').html(message);
  $('#genericModal').modal('show');
}

function refreshEmployeeRows(employees) {
  //clear employees table of any existing body row elements
  $('#employees-table').empty();

  let template = _.template(
    '<%_.forEach(employees, function(employee){%>' +
      '<div class="row body-row" data-id="<%- employee._id %>">' +
      '<div class="col-xs-4 body-column"><%- _.escape(employee.FirstName) %></div>' +
      '<div class="col-xs-4 body-column"><%- _.escape(employee.LastName) %></div>' +
      '<div class="col-xs-4 body-column"><%- _.escape(employee.Position.PositionName) %></div></div>' +
      '<% }); %>'
  );

  let employeeTemplate = template({ employees: employees });

  $('#employees-table').append(employeeTemplate);
}

//allows filtering of all columns with single string
function getFilteredEmployeesModel(filterString) {
  //uses lodash filter and includes function
  let filteredEmployees = _.filter(employeesModel, function(employee) {
    //ignores case, checks string entered
    if (
      employee.FirstName.toUpperCase().includes(filterString.toUpperCase()) ||
      employee.LastName.toUpperCase().includes(filterString.toUpperCase()) ||
      employee.Position.PositionName.toUpperCase().includes(filterString.toUpperCase())
    ) {
      return true;
    }
  });

  return filteredEmployees;
}

function getEmployeeModelById(id) {
  let employeeById = null;
  //searches employeesModel array for employee whose _id matches the provided id
  let findEmpId = _.findIndex(employeesModel, function(employee) {
    return employee._id === id;
  });

  //if employee is found, do a deep copy
  if (findEmpId > -1) {
    employeeById = _.cloneDeep(employeesModel[findEmpId]);
  }

  return employeeById;
}
