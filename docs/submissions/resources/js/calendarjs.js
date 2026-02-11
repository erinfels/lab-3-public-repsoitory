let events = [];
let currentEventId = null;
let editMode = false;

function openAddModal() {
    editMode = false;
    currentEventId = null;
    document.getElementById('eventModalLabel').textContent = 'Create Event';
    document.getElementById('event_form').reset();
    updateLocationOptions();
}

function openEditModal(eventId) {
    editMode = true;
    currentEventId = eventId;
    
    let event = null;
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            event = events[i];
            break;  // Stop looking once we found it
        }
    }
    if (!event) return;

    document.getElementById('eventModalLabel').textContent = 'Edit Event';
    document.getElementById('event_name').value = event.name;
    document.getElementById('event_category').value = event.category;
    document.getElementById('event_weekday').value = event.weekday;
    document.getElementById('event_time').value = event.time;
    document.getElementById('event_modality').value = event.modality;
    
    updateLocationOptions();
    
    if (event.modality === 'in-person') {
        document.getElementById('event_location').value = event.location;
    } else {
        document.getElementById('event_remote_url').value = event.remoteUrl;
    }
    
    document.getElementById('event_attendees').value = event.attendees;

    const modal = new bootstrap.Modal(document.getElementById('event_modal'));
    modal.show();
}

document.getElementById('event_form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const eventData = {
        name: document.getElementById('event_name').value,
        category: document.getElementById('event_category').value,
        weekday: document.getElementById('event_weekday').value,
        time: document.getElementById('event_time').value,
        modality: document.getElementById('event_modality').value,
        location: document.getElementById('event_modality').value === 'in-person' 
            ? document.getElementById('event_location').value 
            : '', //if statement written by claude
        remoteUrl: document.getElementById('event_modality').value === 'remote' 
            ? document.getElementById('event_remote_url').value 
            : '', //if statement written by claude
        attendees: document.getElementById('event_attendees').value
    };
    
    if (editMode && currentEventId) {
        updateEvent(currentEventId, eventData);
    } else {
        addEvent(eventData);
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('event_modal'));
    modal.hide();
    document.getElementById('event_form').reset();
});

function updateLocationOptions() {
    const modality = document.getElementById('event_modality');
    const inPerson = document.getElementById('in-person');
    const remote = document.getElementById('remote');
    const locationInput = document.getElementById('event_location');
    const remoteUrlInput = document.getElementById('event_remote_url');
    
    if (modality.value === 'in-person') {
        inPerson.style.display = 'block';
        remote.style.display = 'none';
        locationInput.required = true;
        remoteUrlInput.required = false;
    } else if (modality.value === 'remote') {
        inPerson.style.display = 'none';
        remote.style.display = 'block';
        locationInput.required = false;
        remoteUrlInput.required = true;
    }
}
function addEvent(eventData) {
    const event = {
        id: Date.now(),
        ...eventData
    };
    events.push(event);
    renderEvent(event);
}

function updateEvent(eventId, eventData) {
    let eventIndex = -1;
    for (let i = 0; i < events.length; i++) {
        if (events[i].id === eventId) {
            eventIndex = i;
            break;
        }
    }
    if (eventIndex === -1) return;

    events[eventIndex] = {
        id: eventId,
        ...eventData
    };

    const oldBox = document.querySelector(`[data-event-id="${eventId}"]`);
    if (oldBox) {
        oldBox.remove();
    }

    renderEvent(events[eventIndex]);
}

function renderEvent(event) {
    const dayColumn = document.getElementById(event.weekday);
    if (!dayColumn) return;
    
    // Create event box as a button
    const eventBox = document.createElement('button');
    eventBox.className = 'event-box btn btn-sm w-100 text-start mb-2';
    eventBox.setAttribute('data-event-id', event.id);
    eventBox.setAttribute('type', 'button');
    eventBox.setAttribute('aria-label', `Edit event: ${event.name}`);
    
    const categoryColors = {
        'academic': '#B4F0EA',
        'work': '#E1CBF2',
        'friends': '#CBD5F2',
        'clubs': '#FFA996'
    };
    eventBox.style.background = categoryColors[event.category];
    
    // Click to edit
    eventBox.onclick = () => openEditModal(event.id);
    
    // Build event content
    let eventContent = 
        `<div> <strong>Event Name: </strong></div>
        <div>${event.name}</div>
        <div><strong>Event Time: </strong> </div>
        <div>${event.time}</div>
        <div><strong>Event Modality: </strong> </div>
        <div>${event.modality}</div>`
        
    ;
    
    if (event.modality === 'in-person') {
        eventContent += `<div><strong>Event Location: </strong> </div>
        <div>${event.location}</div>`;
    } else {
        eventContent += `<div><strong>Event URL: </strong> </div>
        <div>${event.remoteUrl}</div>`;
    }
    
    if (event.attendees) {
        eventContent += `<div><strong>Event Attendees: </strong> </div>
        <div>${event.attendees}</div>`;
    }
    
    eventBox.innerHTML = eventContent;
    
    dayColumn.appendChild(eventBox);
}
document.querySelector('[data-bs-target="#event_modal"]').addEventListener('click', openAddModal);
updateLocationOptions();