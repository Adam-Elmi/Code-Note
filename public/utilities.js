function currentDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

function capitalize(text) {
    const capitalizedText = text.split(' ').map(word => {
        return word[0].toUpperCase() + word.slice(1);
    }).join(' ');
    return capitalizedText;
};

function headBar(text = 'Hello World', parent = document.body) {
    console.log('headBar called with text:', text); // Log for debugging
    const container = document.createElement('div');
    const backDiv = document.createElement('div');
    const content = document.createElement('p');
    const icon = document.createElement('span');
    const inputContainer = document.createElement('div');
    const editInput = document.createElement('input');
    const saveBtn = document.createElement('button');
    const sizeInput = document.createElement('input');

    // Assign classes
    container.className = 'headBar-container';
    backDiv.className = 'back-div';
    content.className = 'headBar-content';
    icon.className = 'fa-solid fa-square-pen cursor-pointer'; // Ensure correct FontAwesome class
    inputContainer.className = 'input-con';
    editInput.className = 'edit-input';
    saveBtn.className = 'save-btn';
    sizeInput.className = 'size-input';

    content.textContent = capitalize(text);
    saveBtn.textContent = 'Save';
    sizeInput.placeholder = 'Size';
    inputContainer.style.display = 'none';

    const sizeBar = () => {
        const target = container;
        let size = sizeInput.value.trim();
        if (size === '' || isNaN(size)) {
            size = 0;  // Default size if input is empty or not a number
        } else {
            size = parseFloat(size);
        }

        const computedStyle = getComputedStyle(target);
        const currentWidth = parseInt(computedStyle.width);
        target.style.width = `${currentWidth + size}px`;
    };

    const handleEdit = (event) => {
        content.style.display = 'none';
        icon.style.display = 'none';
        inputContainer.style.display = 'flex';
        editInput.value = content.textContent;
    };

    icon.addEventListener('click', handleEdit);

    const handleBlur = () => {
        content.textContent = editInput.value;
        content.style.display = 'block';
        icon.style.display = 'block';
        inputContainer.style.display = 'none';
        sizeBar();
    };

    editInput.addEventListener("blur", handleBlur);
    saveBtn.addEventListener('click', handleBlur);

    // Enter key click
    editInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleBlur();
        }
    });

    inputContainer.append(editInput, saveBtn, sizeInput);
    container.append(backDiv, content, icon, inputContainer);
    parent.appendChild(container);
    console.log('headBar elements appended to parent'); // Log for debugging

    return { container, backDiv, content, icon, inputContainer, editInput, saveBtn, sizeInput };
}



function compriseTitle(title) {
    const max = 10;
    const comprise = title.length <= max ? title : title.substring(0, max) + '...';
    let original = title
    return [comprise, original];
};





export {
    currentDate,
    capitalize,
    headBar,
    compriseTitle
};