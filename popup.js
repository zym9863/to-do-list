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

    // 渲染计划任务
    if (plannedTasks.length === 0) {
        plannedTasksList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 11l3 3l8-8"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.47 0 2.85.35 4.09.98"/>
                </svg>
                <p>还没有计划事项<br>添加一些任务来开始你的高效一天吧！</p>
            </div>
        `;
    } else {
        plannedTasks.forEach(task => {
            const li = createTaskElement(task, 'planned');
            plannedTasksList.appendChild(li);
        });
    }

    // 渲染每日任务
    if (dailyTasks.length === 0) {
        dailyTasksList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
                <p>还没有每日任务<br>设置一些日常习惯来保持规律吧！</p>
            </div>
        `;
    } else {
        dailyTasks.forEach(task => {
            const li = createTaskElement(task, 'daily');
            dailyTasksList.appendChild(li);
        });
    }

    // 更新计数器和进度条
    updateCountersAndProgress();
}

// 创建任务元素
function createTaskElement(task, type) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''} ${task.urgent ? 'urgent' : ''} ${task.inProgress ? 'in-progress' : ''}`;
    li.classList.add('new');
    
    const content = document.createElement('div');
    content.className = 'task-content';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    
    const meta = document.createElement('div');
    meta.className = 'task-meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'task-timestamp';
    timeSpan.textContent = formatDate(new Date(task.createdAt));
    
    const priority = document.createElement('span');
    priority.className = `task-priority ${task.urgent ? 'priority-urgent' : 'priority-normal'}`;
    priority.textContent = task.urgent ? '🔥 紧急' : '📋 普通';
    
    meta.appendChild(timeSpan);
    meta.appendChild(priority);
    content.appendChild(textSpan);
    content.appendChild(meta);
    
    const controls = document.createElement('div');
    controls.className = 'task-controls';
    
    const completeBtn = document.createElement('button');
    completeBtn.className = 'complete-btn';
    completeBtn.innerHTML = task.completed ? 
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3l8-8"/></svg>已完成` : 
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>完成`;
    completeBtn.onclick = () => toggleTaskWithAnimation(task.id, type, li);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6l3 18h12l3-18"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>删除`;
    deleteBtn.onclick = () => deleteTaskWithAnimation(task.id, type, li);
    
    controls.appendChild(completeBtn);
    controls.appendChild(deleteBtn);
    
    li.appendChild(content);
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
    setTimeout(() => li.classList.remove('new'), 400);
    
    return li;
}

// 格式化日期
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
        return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
    } else if (hours < 24) {
        return `${hours}小时前`;
    } else if (days < 7) {
        return `${days}天前`;
    } else {
        return date.toLocaleDateString('zh-CN');
    }
}

// 带动画的任务切换
function toggleTaskWithAnimation(id, type, element) {
    element.classList.add('completing');
    setTimeout(() => {
        toggleTask(id, type);
        element.classList.remove('completing');
    }, 300);
}

// 带动画的任务删除
function deleteTaskWithAnimation(id, type, element) {
    element.classList.add('deleting');
    setTimeout(() => {
        deleteTask(id, type);
    }, 400);
}

// 更新计数器和进度条
function updateCountersAndProgress() {
    // 更新计划任务
    const plannedTotal = plannedTasks.length;
    const plannedCompleted = plannedTasks.filter(task => task.completed).length;
    const plannedProgress = plannedTotal > 0 ? (plannedCompleted / plannedTotal) * 100 : 0;
    
    document.getElementById('planned-counter').textContent = `${plannedCompleted}/${plannedTotal}`;
    document.getElementById('planned-progress').style.width = `${plannedProgress}%`;
    
    // 更新每日任务
    const dailyTotal = dailyTasks.length;
    const dailyCompleted = dailyTasks.filter(task => task.completed).length;
    const dailyProgress = dailyTotal > 0 ? (dailyCompleted / dailyTotal) * 100 : 0;
    
    document.getElementById('daily-counter').textContent = `${dailyCompleted}/${dailyTotal}`;
    document.getElementById('daily-progress').style.width = `${dailyProgress}%`;
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