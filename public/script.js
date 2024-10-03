import { compriseTitle } from "./utilities.js";
import { copyCode } from 'https://cdn.jsdelivr.net/npm/copy-share@1.2.6/+esm'; // My own library - CopyShare

localforage.config({
    driver: localforage.INDEXEDDB, 
    name: 'My-Notes', 
    version: 1.0,
    storeName: 'notes', 
    description: 'A database to store notes'
});

let notes = [];

let counter = 1;

function createCodeContainer(value, title) {
    // Random number is used as id to differentiate between the note inputs
    function randomNumber() {
        let [min, max] = [0, 9];
        let range = max - min + 1;
        let random = Math.random() * range;
        let scale = Math.floor(random) + min;
        let output = scale;
    
        return output;
    };

    let id = '';

    for(let i = 0; i < 4; i++) {
        id += randomNumber();
    };

    value = `Write a note... ${id}`;
    title = `Untitled ${id}`;

    // Create elements - note box
    const codeContainer = document.createElement('div');
    const codePanel = document.createElement('div');
    const codeBody = document.createElement('textarea');
    const codeTitle = document.createElement('input');
    const codeTools = document.createElement('div');
    const downloadIcon = document.createElement('button');
    const copyIcon = document.createElement('button');
    const toTextButton = document.createElement('button');
    const toCodeButton = document.createElement('button');
    const trashIcon = document.createElement('button');

    // Styles for code elements
    codeContainer.className = 'w-full h-auto flex flex-col rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden';
    codePanel.className = 'w-full min-h-[50px] bg-gradient-to-r from-[#112] to-[#334] flex justify-between items-center p-3 text-white border-b-2 border-[#445] shadow-lg rounded-t-lg';
    codeBody.className = 'w-full h-full min-h-auto resize-none bg-[#282c34] text-white p-5 outline-none code-body rounded-b-lg font-mono text-sm leading-relaxed overflow-y-auto';
    codeTitle.className = 'cubano w-[50%] bg-transparent border-none outline-none code-title';
    codeTools.className = 'w-[50%] flex justify-end gap-5 overflow-hidden';

    // Set up icons
    downloadIcon.className = 'fa-solid fa-download cursor-pointer';
    copyIcon.className = 'fa-solid fa-copy cursor-pointer';
    toTextButton.className = 'fa-solid fa-t cursor-pointer';
    toCodeButton.className = 'fa-solid fa-code cursor-pointer';
    trashIcon.className = 'fa-solid fa-trash-can cursor-pointer';

    // Title attribute
    toTextButton.title = 'Enable editing text';
    toCodeButton.title = 'Readonly';
    downloadIcon.title = 'Download';
    copyIcon.title = 'Copy text';
    trashIcon.title = 'Delete';
    
    // Create code element for highlighting
    const codeElement = document.createElement('pre');
    const codeInnerElement = document.createElement('code');
    codeInnerElement.className = 'language-js'; // Specify the language
    codeElement.appendChild(codeInnerElement);
    codeElement.style.display = 'none'; // Initially hide the code element

    // Disable spell check 
    codeBody.spellcheck = false;

    // Assign values
    codeTitle.value = title;
    codeBody.value = value;
    
    // Append initial codeBody to codeContainer
    codeContainer.append(codePanel, codeBody, codeElement);

    // Event listener for switching to text
    toTextButton.addEventListener('click', () => {
        codeBody.style.display = 'block'; // Show textarea
        codeElement.style.display = 'none'; // Hide highlighted code
    });

    // Event listener for switching to code
    toCodeButton.addEventListener('click', () => {
        codeInnerElement.textContent = codeBody.value;
        codeBody.style.display = 'none'; 
        codeElement.style.display = 'block';

        // Highlight the new code block using Prism.js
        Prism.highlightElement(codeInnerElement);
    });

    function autoResize(textarea) {
        textarea.style.height = 'auto'; 
        textarea.style.height = `${textarea.scrollHeight}px`; 
    }

    // Event listener for input to auto-resize
    codeBody.addEventListener('input', () => autoResize(codeBody));

    // Function to download code from the textarea
    function downloadCode(fileName, codeContent) {
        const blob = new Blob([codeContent], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    downloadIcon.addEventListener('click', () => {
        const codeContent = codeBody.value; 
        downloadCode('my-code-note.txt', codeContent); 
    });

    // Copy Data
    copyIcon.addEventListener('click', () => {
        copyCode(codeBody.value || codeInnerElement.textContent, 'Javascript (Default)');
    });

    // Remove note box
    function removeNoteBox(event) {
        const index = notes.findIndex(note => {
            return note.elementTitle.some(title => title === event.target.parentElement.parentElement.children[0].value);
        });
        event.target.parentElement.parentElement.parentElement.remove();
        notes.forEach(note => {
            note.elementTitle.splice(index, 1);
            note.elementValue.splice(index, 1);
        });
        
        // Then save changes
        localforage.setItem('notes', notes).then(() => {
            console.log('Notes are saved!');
        }).catch(error => {
            console.log(error);
        });
        console.log(notes);
    };

    trashIcon.addEventListener('click', removeNoteBox);

    // Adding tab functionality
    codeBody.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent the default tab behavior
            // Get the cursor position
            const start = this.selectionStart;
            const end = this.selectionEnd;
            // Set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
            // Put the cursor after the tab
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });

    // Append tools to code panel
    codeTools.append(toTextButton, toCodeButton, downloadIcon, copyIcon, trashIcon);
    codePanel.append(codeTitle, codeTools);
    return [codeContainer, title, value, codeBody, codeTitle];
}


function createNote(note = {text : `Hello World ${counter}`, elementTitle : [], elementValue : []}) {
    counter++;
    
    function saveToLocal() {
        localforage.setItem('notes', notes).then(() => {
            console.log('Notes are saved!');
        }).catch(error => {
            console.log(error);
        });
    };

    const noteBar = document.createElement('div');
    const noteTitle = document.createElement('p');
    const noteIcon = document.createElement('span');
    const noteClear = document.createElement('span');
    const iconWrapper = document.createElement('div');
    const editTitle = document.createElement('input');
    const inputContainer = document.createElement('div');
    const saveBtn = document.createElement('button');
    const noteAreaContainer = document.createElement('div');
    const noteDiv = document.createElement('div');
    const noteInput = document.createElement('div');
    const noteTools = document.createElement('div');

    // Create sections for title and icons
    const titleSection = document.createElement('div');
    const iconSection = document.createElement('div');
    const addNoteIcon = document.createElement('span');
    // const keysIcon = document.createElement('span'); // For next version
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("fill", "#000000");
    svgIcon.setAttribute("viewBox", "0 0 52 52");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("enable-background", "new 0 0 52 52");
    svgIcon.setAttribute("xml:space", "preserve");
    const svgPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svgPath1.setAttribute("d", "M46,8H6c-1.1,0-2,0.9-2,2v32c0,1.1,0.9,2,2,2h40c1.1,0,2-0.9,2-2V10C48,8.9,47.1,8,46,8z M44,40H8V12h36V40z ");
    const svgPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svgPath2.setAttribute("d", "M21,38h-9.9c-0.6,0-1-0.4-1-1V15c0-0.6,0.4-1,1-1H21c0.6,0,1,0.4,1,1v22C22,37.6,21.6,38,21,38z");
    svgIcon.appendChild(svgPath1);
    svgIcon.appendChild(svgPath2);    
    const copyRight = document.createElement('a');

    // Assign classes
    noteBar.className = 'note-bar border-b-[1.5px]';
    noteTitle.className = 'note-title text-slate-600';
    editTitle.className = 'edit-input';
    inputContainer.className = 'input-con';
    saveBtn.className = 'save-btn';
    noteIcon.className = 'fa-solid fa-file-pen text-slate-700 hover:text-blue-600';
    noteClear.className = 'fa-solid fa-trash hover:text-red-700';
    iconWrapper.className = 'flex-1 flex justify-end items-center gap-5';
    noteAreaContainer.className = 'w-full h-full note-area';
    noteDiv.className = 'w-full h-screen bg-slate-100 bar';
    noteTools.className = 'w-full min-h-[50px] p-4 bg-white border-b-2 shadow-md flex justify-between';
    noteInput.className = 'w-full h-full px-4 py-2 bg-white outline-none flex flex-col gap-5 note-input';
    titleSection.className = 'cubano text-[1rem] title-section text-blue-500 min-w-[200px]';
    iconSection.className = 'flex gap-5 w-[500px] justify-end items-center flex-wrap overflow-hidden flex-wrap';
    iconSection.style.flexWrap = 'wrap';

    // Create icons for the main note
    addNoteIcon.className = 'fa-solid fa-plus cursor-pointer p-2 hover:bg-blue-50 code-icon';
    // keysIcon.className = 'fa-solid fa-keyboard cursor-pointer p-2 hover:bg-blue-50'; // For next version
    svgIcon.setAttribute('width', '34px');
    svgIcon.setAttribute('height', '34px');
    svgIcon.setAttribute('cursor', 'pointer');
    svgIcon.classList.add('hover:bg-blue-50');
    svgIcon.classList.add('p-2');
    copyRight.className = 'text-slate-400 hover:text-blue-400 text-[0.8rem] font-semibold';

    copyRight.innerHTML = '&copy; 2024 Adam Elmi - version 1.0';
    copyRight.href = 'https://github.com/Adam-Elmi/Code-Note';
    copyRight.setAttribute('target', '_blank');
    
    // Title attribute
    addNoteIcon.title = 'Add text input';
    svgIcon.setAttribute('title', 'Toggle sidebar');
    noteIcon.title = 'Edit title name';
    noteClear.title = 'Delete Note';

    // Title section text
    titleSection.textContent = compriseTitle(note.text)[1];

    // Append icons to the icon section
    iconSection.append(svgIcon, addNoteIcon, copyRight);

    // Append title and icon sections to noteTools
    noteTools.append(titleSection, iconSection);

    inputContainer.style.display = 'none';
    saveBtn.textContent = 'Save';

    editTitle.value = note.text;

    // Loop through the code titles 
    note.elementTitle.forEach((code_title, index) => {
        const textareaValue = note.elementValue[index] || ''; // Load saved textarea value

        let [codeContainer, title, value, codeBody, codeTitle] = createCodeContainer(textareaValue, code_title);

        codeTitle.value = code_title;  // Assign saved title value
        codeBody.value = textareaValue;  // Assign saved code body value

        // Listen for changes in codeTitle and update stored value
        codeTitle.addEventListener('input', function () {
            note.elementTitle[index] = this.value;
            saveToLocal(); // Persist changes
        });

        // Listen for changes in codeBody and update stored value
        codeBody.addEventListener('input', function () {
            note.elementValue[index] = this.value;
            saveToLocal(); // Persist changes
        });

        // Append the code container to noteInput
        noteInput.append(codeContainer);
    });

    // Append elements to the DOM
    inputContainer.append(editTitle, saveBtn);
    iconWrapper.append(noteIcon, noteClear)
    noteBar.append(noteTitle, iconWrapper, inputContainer);
    noteDiv.append(noteTools, noteInput);
    noteAreaContainer.append(noteDiv);
    document.getElementById('main').appendChild(noteAreaContainer);
    document.getElementById('notes-wrapper').appendChild(noteBar);

    // Event listeners for editing
    const handleEdit = () => {
        noteTitle.style.display = 'none';
        noteIcon.style.display = 'none';
        noteClear.style.display = 'none';
        inputContainer.style.display = 'flex';
        editTitle.value = note.text;
        titleSection.textContent = editTitle.value;
    };

    const handleBlur = () => {
        const index = note.elementTitle.findIndex(value => value === note.text);
        note.text = editTitle.value;
        noteTitle.textContent = compriseTitle(note.text)[0];
        noteIcon.style.display = 'block';
        noteClear.style.display = 'block';
        noteTitle.style.display = 'block';
        inputContainer.style.display = 'none';
        titleSection.textContent = editTitle.value;

        if (index !== -1) {
            note.elementTitle[index] = editTitle.value;
        } else {
            console.log('Failed');
        }

        saveToLocal();
    };

    noteTitle.addEventListener('dblclick', handleEdit);
    noteIcon.addEventListener('click', handleEdit);
    editTitle.addEventListener('blur', handleBlur);
    saveBtn.addEventListener('click', handleBlur);

    editTitle.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleBlur();
        }
    });

    // Set the initial title text
    noteTitle.textContent = compriseTitle(note.text)[0];
    
    // Get all note bars and note areas
    const NOTE_BARS = document.querySelectorAll('.note-bar');
    const NOTE_AREAS = document.querySelectorAll('.note-area');

    NOTE_AREAS.forEach(noteArea => noteArea.style.display = 'none');
    NOTE_AREAS[NOTE_AREAS.length - 1].style.display = 'block';

    // Loop through each note bar
    NOTE_BARS.forEach((noteBar, index) => {
        noteBar.addEventListener('click', () => {
            
            // Hide all note areas
            NOTE_AREAS.forEach(noteArea => noteArea.style.display = 'none');

            // Show only the clicked note area based on its index
            NOTE_AREAS[index].style.display = 'block';
            saveToLocal();
        });
    });

    // Toggle side bar
    let isOpen = localStorage.getItem('sidebar') === 'true'; // Load initial state from localStorage

    svgIcon.addEventListener('click', () => {
        // Toggle the state first
        isOpen = !isOpen;

        if (isOpen) {
            document.getElementById('main').className = 'w-[calc(100% - 200px)] h-screen ml-[200px] bg-white';
            document.getElementById('sidebar').classList.remove('hide-sidebar');
        } else {
            document.getElementById('main').className = 'w-full h-screen bg-white';
            document.getElementById('sidebar').classList.add('hide-sidebar');
        }

        localStorage.setItem('sidebar', isOpen); // Store the updated state in localStorage
    });

    // Add code section on clicking the add note icon or pressing Shift + T
    addNoteIcon.addEventListener('click', () => {
        addNewNote();
    });

    function addNewNote() {
        let [newCodeContainer, title, value, codeBody, codeTitle] = createCodeContainer();
        note.elementTitle.push(title);
        note.elementValue.push(value);

        codeTitle.addEventListener('input', function() {
            const findIndex = note.elementTitle.findIndex(t => t === title);
            title = this.value;
            note.elementTitle[findIndex] = title;
        });

        codeBody.addEventListener('input', function () {
            const findIndex = note.elementValue.findIndex(v => v === value);
            value = this.value;
            note.elementValue[findIndex] = value;
        });

        noteInput.append(newCodeContainer);        
        saveToLocal();
    }

    // Remove note bar
    noteClear.addEventListener('click', (event) => {
        const matchedValue = noteBar.children[2].children[0].value;
        console.log(matchedValue);
        notes = notes.filter(note => note.text !== matchedValue);
        event.target.parentElement.parentElement.remove();
        noteAreaContainer.remove();
        check();

        saveToLocal();
    })

    

    // Store notes
    function saveNotes() {  
        notes.push(note);
    };

    saveNotes(); 

    saveToLocal();

    return [noteBar, noteAreaContainer, createCodeContainer];
}


function check() {
    const notesWrapper = document.getElementById('notes-wrapper');
    const placeholder = document.getElementById('placeholder');
    placeholder.style.opacity = notesWrapper.childNodes.length > 0 ? 0 : 1;
    setTimeout(() => {
        placeholder.style.display = notesWrapper.childNodes.length > 0 ? 'none' : 'flex';
    }, 300)
    return notesWrapper.childNodes;
};


function addNote() {
    createNote();
    check();
};

// Initialize the add note button
const addBtn = document.getElementById('addBtn');
addBtn.title = 'Add note';

addBtn.addEventListener('click', () => {
    addNote();
});


const option_2 = document.getElementById('add-note-option-2');

option_2.addEventListener('click', () => {
    addNote();
})


// Load Notes
function loadNotes() {
    localforage.getItem('notes').then(savedNotes => {
        if (savedNotes && savedNotes.length > 0) {
            savedNotes.forEach(savedNote => {
                createNote(savedNote); 
            });
        } else {
            console.log("No saved notes found.");
        }
    }).catch(error => {      
        console.error("Error loading notes:", error);
    });
    localforage.clear().then(() => {
        console.log('cleared');
    })
    
};


document.addEventListener('DOMContentLoaded', () => {
    loadNotes(); // Load saved notes when the page is loaded
    check();
    // Toggle state
    let isOpen = localStorage.getItem('sidebar');

    // Ensure we are handling the string values correctly
    if (isOpen !== null) {
        if (isOpen === 'true') { // Check explicitly for 'true'
            document.getElementById('main').className = 'w-[calc(100% - 200px)] h-screen ml-[200px] bg-white';
            document.getElementById('sidebar').classList.remove('hide-sidebar');
        } else {
            document.getElementById('main').className = 'w-full h-screen bg-white';
            document.getElementById('sidebar').classList.add('hide-sidebar');
        }
    }
});

const searchInput = document.getElementById('search');

searchInput.addEventListener('input', function () {
    const wrapper = document.getElementById('notes-wrapper');
    if(wrapper.children.length > 0) {
        const nodeIntoArray = Array.from(wrapper.children);
        const doSearching = nodeIntoArray.filter(child => {
            return child.children[0].tagName === 'P' && child.children[0].textContent.toLowerCase().includes(this.value.toLowerCase());
        });
        nodeIntoArray.forEach(child => {
            if(doSearching.includes(child)) {
                child.style.display = 'flex';
            }
            else {
                child.style.display = 'none';
            }
        });
    }
});

// For next version
// const hideBtn = document.getElementById('hide-shortcuts');
// const shortcuts = document.getElementById('shortcuts-container');

// function hide() {
//     if (shortcuts) {
//         shortcuts.style.display = 'none';
//     }
// };

// hideBtn.addEventListener('click', hide);
// shortcuts.addEventListener('click', hide)



