// Budget Controller
let budgetController = (() => {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        totalIncome > 0
            ? this.percentage = Math.round((this.value / totalIncome) * 100)
            : this.percentage = -1
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };

    let calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach( item => {
            sum += item.value;
        });
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: (type, des, val) => {
            let newItem;
            let ID;
            //Create New ID, grabs last tiem then adds one
            ID = ( data.allItems[type].length > 0 ) ? data.allItems[type][data.allItems[type].length -1].id + 1 : 0
            //Create new item
            type === 'exp' 
                ? newItem = new Expense(ID, des, val)
                : newItem = new Income(ID, des, val);
            //Push into data
            data.allItems[type].push(newItem);
            //Push new data 
            return newItem;
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        calculateBudget: () => {
            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // 2. Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // 3. Calculate percentage of income that we spent
            data.totals.inc > 0 && ( data.percentage = Math.round( (data.totals.exp / data.totals.inc) * 100 ) )
        },
        calculatePercentages: () => {
            data.allItems.exp.forEach( item => item.calcPercentage(data.totals.inc) );
        },
        getPercentages: () => {
            let allPerc = data.allItems.exp.map( item => item.getPercentage() )
            return allPerc
        },
        deleteItem: (type, id) => {
            let ids, index;
            ids = data.allItems[type].map( item => item.id );
            index = ids.indexOf(id);
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: () => {
            console.log(data);
        }
    };

})();



// UI Controller
let UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        exspenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    let formatNumbers = (num, type) => {
        let numSplit, int, dec, sign;
        // + or -, 2 decimal points, comma for thousands
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        int.length > 3 && ( int = int.substr(0, int.length - 3) + ',' + int.substr(int.length -3, 3));
        type === 'exp' ? sign = '-' : sign = '+';
        return `${sign}  ${int}.${dec}`
    };

    let nodeListForEach = (list, callback) => {
        for(let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: (obj, type) => {
            let html, newHtml, element;
            // Create HTML string with placholder text
            type === 'inc' 
                ? html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
                : html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            //Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));
            // Insert HTML into the DOM
            type === 'inc' ?  element = DOMstrings.incomeContainer : element = DOMstrings.exspenseContainer
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: (selectorID) => {
            let el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: () => {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' +  DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach( f => f.value = "");
            fieldsArr[0].focus();
        },
        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumbers(obj.totalInc, type);
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumbers(obj.totalExp, type);
            obj.percentage > 0 
                ? document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' 
                : document.querySelector(DOMstrings.percentageLabel).textContent = '---'

        },
        displayPercentages: (percentages) => {
            let fields;
            fields = document.querySelectorAll(DOMstrings.expensePercLabel);
            //calling reusable func and passing it a call back to use
            nodeListForEach(fields, (item, index) => {
                percentages[index] > 0 
                    ? item.textContent = percentages[index] + '%'
                    : item.textContent = '---'
            });
        },
        displayMonth: () => {
            let now, year, month, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]}  ${year}`;
        },
        changedType: () => {
            let fields;
            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            nodeListForEach(fields, (item) => {
                item.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        getDOMstrings: () => {
            return DOMstrings;
        },
    };

})();



// Global app controller
let controller = ((budgetCtrl, UICtrl) => {

    const setupEventListeners = () => {
        const DOM = UIController.getDOMstrings();
        //Listens for click of add button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        //Listens for enter press to add button
        document.addEventListener('keypress', (e) => {
            if(e.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        //Listens for click event using event bubbling
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    }

    const updateBudget = () => {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return Budget
        let budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    }

    const updatePercentages = () => {
        // 1. Calculate the percentages
        budgetController.calculatePercentages();
        // 2. Read from budget controller
        let percentages = budgetController.getPercentages();
        // 3. Update UI
        UIController.displayPercentages(percentages);
    }

    const ctrlAddItem = () => {
        let input, newItem;

        // 1. Get field data
        input = UICtrl.getInput();

        // Check for data then do rest of the steps
        if(input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            // 2. Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            // 3. Add the new item to the UI
            UIController.addListItem(newItem, input.type);
            // 4. Clear Fields
            UIController.clearFields();
            // 5. Calc and update budget
            updateBudget();
            // 6. update percentages
            updatePercentages();
        } else {
            console.log("Required"); // add error pop out here
        }
    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitId, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID) {
            splitID = itemID.split('-')
            type = splitID[0];
            ID =  parseInt( splitID[1] );
        }
        // 1. delete item from data structure
        budgetController.deleteItem(type, ID);
        // 2. delete item from the ui 
        UIController.deleteListItem(itemID);
        // 3. update and show new budget
        updateBudget();
        // 4. update percentages
        updatePercentages();
    };

    return {
        init: () => {
            console.log("App Started");
            setupEventListeners();
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UIController.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();