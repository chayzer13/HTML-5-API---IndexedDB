let db;
const dbName = "myDatabase";
const tableName = "myTable";

const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    if (!db.objectStoreNames.contains(tableName)) {
        db.createObjectStore(tableName, { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    updateTable();
};

request.onerror = function(event) {
    console.error("Ошибка при открытии базы данных:", event.target.errorCode);
};

function updateTable() {
    const transaction = db.transaction([tableName], "readonly");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const data = event.target.result;
        const tableBody = document.querySelector("#data-table tbody");
        tableBody.innerHTML = ""; 

        data.forEach(item => {
            const row = document.createElement("tr");

            const idCell = document.createElement("td");
            idCell.textContent = item.id;
            row.appendChild(idCell);

            const nameCell = document.createElement("td");
            nameCell.textContent = item.name;
            nameCell.contentEditable = true;
            row.appendChild(nameCell);

            const changeCell = document.createElement("td");
            changeCell.innerHTML = `<span class='action' onclick='updateItem(${item.id})'>Изменить</span>`;
            row.appendChild(changeCell);

            const deleteCell = document.createElement("td");
            deleteCell.innerHTML = `<span class='action' onclick='deleteItem(${item.id})'>Удалить</span>`;
            row.appendChild(deleteCell);

            tableBody.appendChild(row);
        });
    };

    request.onerror = function(event) {
        console.error("Ошибка при получении данных:", event.target.errorCode);
    };
}

function saveItem() {
    const name = document.getElementById("name-input").value;
    if (name === "") {
        alert("Поле <Имя> не может быть пустым");
        return;
    }

    const transaction = db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.add({ name });

    request.onsuccess = function() {
        alert("Запись добавлена");
        document.getElementById("name-input").value = ""; 
        updateTable();
    };

    request.onerror = function(event) {
        console.error("Ошибка при добавлении записи:", event.target.errorCode);
    };
}

function updateItem(key) {
    const transaction = db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.get(key);

    request.onsuccess = function(event) {
        const data = event.target.result;
        const newName = document.querySelector(`td[contenteditable="true"]`).textContent;
        data.name = newName;

        const updateRequest = objectStore.put(data);
        updateRequest.onsuccess = function() {
            alert("Запись обновлена");
            updateTable();
        };
    };

    request.onerror = function(event) {
        console.error("Ошибка при обновлении записи:", event.target.errorCode);
    };
}

function deleteItem(key) {
    const transaction = db.transaction([tableName], "readwrite");
    const objectStore = transaction.objectStore(tableName);
    const request = objectStore.delete(key);

    request.onsuccess = function() {
        alert("Запись удалена");
        updateTable();
    };

    request.onerror = function(event) {
        console.error("Ошибка при удалении записи:", event.target.errorCode);
    };
}
