// 게임 상태
let apples = [];
let selectedApples = [];
let isSelecting = false;
let selectionStart = null;
let score = 0;
const GRID_ROWS = 10;
const GRID_COLS = 20;

// DOM 요소
const appleGrid = document.getElementById('apple-grid');
const selectionBox = document.getElementById('selection-box');
const scoreDisplay = document.getElementById('score');
const resetBtn = document.getElementById('reset-btn');

// 게임 초기화
function initGame() {
    apples = [];
    selectedApples = [];
    score = 0;
    scoreDisplay.textContent = score;
    appleGrid.innerHTML = '';
    
    // 사과 그리드 생성
    for (let i = 0; i < GRID_ROWS * GRID_COLS; i++) {
        const number = Math.floor(Math.random() * 9) + 1; // 1-9 사이의 랜덤 숫자
        const apple = {
            id: i,
            number: number,
            element: createAppleElement(number, i)
        };
        apples.push(apple);
        appleGrid.appendChild(apple.element);
    }
}

// 사과 요소 생성
function createAppleElement(number, id) {
    const apple = document.createElement('div');
    apple.className = 'apple';
    apple.textContent = number;
    apple.dataset.id = id;
    return apple;
}

// 마우스 이벤트 처리
appleGrid.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);

// 터치 이벤트 처리 (모바일 지원)
appleGrid.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd);

function handleMouseDown(e) {
    if (e.target.classList.contains('apple')) {
        isSelecting = true;
        selectionStart = {
            x: e.clientX,
            y: e.clientY,
            appleId: parseInt(e.target.dataset.id)
        };
        selectApple(parseInt(e.target.dataset.id));
        updateSelectionBox(e);
    }
}

function handleMouseMove(e) {
    if (isSelecting) {
        updateSelectionBox(e);
        const rect = appleGrid.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        highlightApplesInRange(x, y);
    }
}

function handleMouseUp(e) {
    if (isSelecting) {
        checkAndRemoveApples();
        resetSelection();
    }
}

function handleTouchStart(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if (target && target.classList.contains('apple')) {
            e.preventDefault();
            isSelecting = true;
            selectionStart = {
                x: touch.clientX,
                y: touch.clientY,
                appleId: parseInt(target.dataset.id)
            };
            selectApple(parseInt(target.dataset.id));
            updateSelectionBox({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }
}

function handleTouchMove(e) {
    if (isSelecting && e.touches.length > 0) {
        e.preventDefault();
        const touch = e.touches[0];
        updateSelectionBox({ clientX: touch.clientX, clientY: touch.clientY });
        const rect = appleGrid.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        highlightApplesInRange(x, y);
    }
}

function handleTouchEnd(e) {
    if (isSelecting) {
        e.preventDefault();
        checkAndRemoveApples();
        resetSelection();
    }
}

// 사과 선택
function selectApple(id) {
    if (!selectedApples.includes(id)) {
        selectedApples.push(id);
        const apple = apples.find(a => a.id === id);
        if (apple && apple.element) {
            apple.element.classList.add('selected');
        }
    }
}

// 사과 선택 해제
function deselectApple(id) {
    const index = selectedApples.indexOf(id);
    if (index > -1) {
        selectedApples.splice(index, 1);
        const apple = apples.find(a => a.id === id);
        if (apple && apple.element) {
            apple.element.classList.remove('selected');
        }
    }
}

// 범위 내 사과 하이라이트
function highlightApplesInRange(x, y) {
    const rect = appleGrid.getBoundingClientRect();
    const gridX = x;
    const gridY = y;
    
    // 모든 사과 요소 확인
    apples.forEach(apple => {
        if (apple.element) {
            const appleRect = apple.element.getBoundingClientRect();
            const appleX = appleRect.left + appleRect.width / 2 - rect.left;
            const appleY = appleRect.top + appleRect.height / 2 - rect.top;
            
            // 시작점과 현재 커서 위치 사이에 있는지 확인
            const startRect = appleGrid.getBoundingClientRect();
            const startX = selectionStart.x - startRect.left;
            const startY = selectionStart.y - startRect.top;
            
            // 사각형 범위 확인
            const minX = Math.min(startX, gridX);
            const maxX = Math.max(startX, gridX);
            const minY = Math.min(startY, gridY);
            const maxY = Math.max(startY, gridY);
            
            if (appleX >= minX && appleX <= maxX && appleY >= minY && appleY <= maxY) {
                if (!selectedApples.includes(apple.id)) {
                    selectApple(apple.id);
                }
            } else {
                if (selectedApples.includes(apple.id) && apple.id !== selectionStart.appleId) {
                    deselectApple(apple.id);
                }
            }
        }
    });
}

// 선택 박스 업데이트
function updateSelectionBox(e) {
    if (!isSelecting || !selectionStart) return;
    
    const rect = appleGrid.getBoundingClientRect();
    const startX = selectionStart.x - rect.left;
    const startY = selectionStart.y - rect.top;
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    selectionBox.style.display = 'block';
    selectionBox.style.left = left + 'px';
    selectionBox.style.top = top + 'px';
    selectionBox.style.width = width + 'px';
    selectionBox.style.height = height + 'px';
}

// 선택 초기화
function resetSelection() {
    selectedApples.forEach(id => {
        const apple = apples.find(a => a.id === id);
        if (apple && apple.element) {
            apple.element.classList.remove('selected');
        }
    });
    selectedApples = [];
    isSelecting = false;
    selectionStart = null;
    selectionBox.style.display = 'none';
}

// 사과 제거 확인 및 처리
function checkAndRemoveApples() {
    if (selectedApples.length === 0) return;
    
    // 선택된 사과들의 숫자 합 계산
    const sum = selectedApples.reduce((total, id) => {
        const apple = apples.find(a => a.id === id);
        return total + (apple ? apple.number : 0);
    }, 0);
    
    if (sum === 10) {
        // 합이 10이면 사과 제거
        selectedApples.forEach(id => {
            const apple = apples.find(a => a.id === id);
            if (apple && apple.element) {
                apple.element.classList.add('removing');
                setTimeout(() => {
                    if (apple.element && apple.element.parentNode) {
                        apple.element.remove();
                    }
                    apple.element = null;
                }, 500);
            }
        });
        
        // 점수 추가
        score += selectedApples.length;
        scoreDisplay.textContent = score;
        
        // 배열에서 제거
        apples = apples.filter(a => !selectedApples.includes(a.id));
        
        // 게임 종료 확인
        if (apples.length === 0) {
            setTimeout(() => {
                alert(`게임 종료! 최종 점수: ${score}`);
                initGame();
            }, 600);
        }
    }
}

// 새 게임 버튼
resetBtn.addEventListener('click', initGame);

// 게임 시작
initGame();

