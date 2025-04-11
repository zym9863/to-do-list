// 初始化任务列表
let plannedTasks = [];
let dailyTasks = [];

// DOM 元素
const plannedTaskInput = document.getElementById('planned-task-input');
const dailyTaskInput = document.getElementById('daily-task-input');
const plannedTasksList = document.getElementById('planned-tasks');
const dailyTasksList = document.getElementById('daily-tasks');

// 加载保存的任务
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
});

// 添加事件监听器
document.getElementById('add-planned-task').addEventListener('click', () => addTask('planned'));
document.getElementById('add-daily-task').addEventListener('click', () => addTask('daily'));

plannedTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask('planned');
});

dailyTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask('daily');
});

// 添加任务
function addTask(type) {
    const input = type === 'planned' ? plannedTaskInput : dailyTaskInput;
    const text = input.value.trim();
    
    if (text) {
        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            urgent: text.includes('!') || text.includes('紧急'),
            inProgress: false,
            createdAt: new Date().toISOString()
        };

        if (type === 'planned') {
            plannedTasks.push(task);
        } else {
            dailyTasks.push(task);
        }

        input.value = '';
        saveTasks();
        renderTasks();
    }
}

// 删除任务
function deleteTask(id, type) {
    if (type === 'planned') {
        plannedTasks = plannedTasks.filter(task => task.id !== id);
    } else {
        dailyTasks = dailyTasks.filter(task => task.id !== id);
    }
    saveTasks();
    renderTasks();
}

// 切换任务完成状态
function toggleTask(id, type) {
    const tasks = type === 'planned' ? plannedTasks : dailyTasks;
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// 渲染任务列表
function renderTasks() {
    plannedTasksList.innerHTML = '';
    dailyTasksList.innerHTML = '';

    plannedTasks.forEach(task => {
        const li = createTaskElement(task, 'planned');
        plannedTasksList.appendChild(li);
    });

    dailyTasks.forEach(task => {
        const li = createTaskElement(task, 'daily');
        dailyTasksList.appendChild(li);
    });
}

// 创建任务元素
function createTaskElement(task, type) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} ${task.urgent ? 'urgent' : ''} ${task.inProgress ? 'in-progress' : ''}`;
    li.classList.add('new');
    
    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'task-timestamp';
    timeSpan.textContent = new Date(task.createdAt).toLocaleString();
    
    const controls = document.createElement('div');
    controls.className = 'task-controls';
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.innerHTML = task.completed ? '取消完成' : '完成';
    completeBtn.onclick = () => toggleTask(task.id, type);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '删除';
    deleteBtn.onclick = () => deleteTask(task.id, type);
    
    controls.appendChild(completeBtn);
    controls.appendChild(deleteBtn);
    
    li.appendChild(textSpan);
    li.appendChild(timeSpan);
    li.appendChild(controls);
    
    // 添加拖拽功能
    li.draggable = true;
    li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        li.classList.add('dragging');
    });
    
    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
    });
    
    // 移除new类名以结束动画
    setTimeout(() => li.classList.remove('new'), 300);
    
    return li;
}

// 保存任务到本地存储
function saveTasks() {
    chrome.storage.local.set({
        plannedTasks: plannedTasks,
        dailyTasks: dailyTasks,
        lastUpdate: new Date().toISOString()
    });
}

// 从本地存储加载任务
function loadTasks() {
    chrome.storage.local.get(['plannedTasks', 'dailyTasks', 'lastUpdate'], (result) => {
        plannedTasks = result.plannedTasks || [];
        
        // 检查是否需要重置每日任务
        const lastUpdate = result.lastUpdate ? new Date(result.lastUpdate) : null;
        const now = new Date();
        
        if (!lastUpdate || !isSameDay(lastUpdate, now)) {
            // 重置每日任务的完成状态
            dailyTasks = (result.dailyTasks || []).map(task => ({
                ...task,
                completed: false
            }));
        } else {
            dailyTasks = result.dailyTasks || [];
        }
        
        renderTasks();
    });
}

// 检查是否是同一天
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}