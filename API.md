# 선린타임 API 문서

## 개요
선린 커뮤니티 "선린타임" 백엔드 API 문서입니다.

## 기본 정보
- Base URL: `http://localhost:5000/api`
- Authentication: JWT Bearer Token
- Content-Type: `application/json`

## 인증 (Authentication)

### Google OAuth 로그인
```
POST /api/auth/google-login
```

**Request Body:**
```json
{
    "token": "google_oauth_token"
}
```

**Response:**
```json
{
    "access_token": "jwt_access_token",
    "refresh_token": "jwt_refresh_token",
    "user": {
        "id": 1,
        "email": "student@sunrint.hs.kr",
        "name": "홍길동",
        "profile_image": "https://...",
        "is_verified": true,
        "grade": 2,
        "class_num": 5
    }
}
```

### 토큰 갱신
```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

### 프로필 조회
```
GET /api/auth/profile
Authorization: Bearer {access_token}
```

### 프로필 수정
```
PUT /api/auth/profile
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "student_id": "10517",
    "grade": 2,
    "class_num": 5
}
```

## 게시글 (Posts)

### 게시글 목록 조회
```
GET /api/posts?page=1&per_page=20&category=general&sort=latest
```

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `per_page`: 페이지당 게시글 수 (기본값: 20)
- `category`: 카테고리 필터
- `sort`: 정렬 (latest, popular, votes)

### 게시글 상세 조회
```
GET /api/posts/{post_id}
```

### 게시글 작성
```
POST /api/posts
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "title": "게시글 제목",
    "content": "게시글 내용",
    "category": "general",
    "is_anonymous": true
}
```

### 게시글 수정
```
PUT /api/posts/{post_id}
Authorization: Bearer {access_token}
```

### 게시글 삭제
```
DELETE /api/posts/{post_id}
Authorization: Bearer {access_token}
```

### 게시글 추천/비추천
```
POST /api/posts/{post_id}/vote
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "is_upvote": true
}
```

### 카테고리 목록
```
GET /api/categories
```

## 댓글 (Comments)

### 댓글 목록 조회
```
GET /api/posts/{post_id}/comments
```

### 댓글 작성
```
POST /api/posts/{post_id}/comments
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "content": "댓글 내용",
    "is_anonymous": true,
    "parent_id": null
}
```

### 댓글 수정
```
PUT /api/comments/{comment_id}
Authorization: Bearer {access_token}
```

### 댓글 삭제
```
DELETE /api/comments/{comment_id}
Authorization: Bearer {access_token}
```

### 대댓글 조회
```
GET /api/comments/{comment_id}/replies
```

## 시간표 (Timetable)

### 시간표 조회
```
GET /api/timetable?semester=2024-2
Authorization: Bearer {access_token}
```

### 시간표 항목 추가
```
POST /api/timetable
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "subject_name": "국어",
    "teacher_name": "김선생",
    "classroom": "2-5",
    "day_of_week": 0,
    "period": 1,
    "semester": "2024-2"
}
```

### 시간표 항목 수정
```
PUT /api/timetable/{item_id}
Authorization: Bearer {access_token}
```

### 시간표 항목 삭제
```
DELETE /api/timetable/{item_id}
Authorization: Bearer {access_token}
```

### 시간표 일괄 업데이트
```
POST /api/timetable/bulk
Authorization: Bearer {access_token}
```

## 수행평가 (Assignments)

### 수행평가 목록 조회
```
GET /api/assignments?page=1&subject=국어&grade=2&own=false
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `subject`: 과목 필터
- `grade`: 학년 필터
- `own`: 내 수행평가만 조회 (true/false)

### 수행평가 상세 조회
```
GET /api/assignments/{assignment_id}
Authorization: Bearer {access_token}
```

### 수행평가 등록
```
POST /api/assignments
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "title": "국어 발표 과제",
    "subject": "국어",
    "description": "문학 작품 분석 발표",
    "due_date": "2024-08-15T23:59:59",
    "grade": 2,
    "is_shared": true
}
```

### 수행평가 수정
```
PUT /api/assignments/{assignment_id}
Authorization: Bearer {access_token}
```

### 수행평가 삭제
```
DELETE /api/assignments/{assignment_id}
Authorization: Bearer {access_token}
```

### 과목 목록 조회
```
GET /api/assignments/subjects
Authorization: Bearer {access_token}
```

## 에러 코드

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복 데이터)
- `500`: 서버 오류

### 에러 응답 형식
```json
{
    "error": "에러 메시지"
}
```

## 데이터 모델

### User
- `id`: 사용자 ID
- `email`: 이메일 (학교 도메인)
- `name`: 이름
- `student_id`: 학번
- `grade`: 학년
- `class_num`: 반
- `is_verified`: 인증 여부

### Post
- `id`: 게시글 ID
- `title`: 제목
- `content`: 내용
- `category`: 카테고리
- `is_anonymous`: 익명 여부
- `view_count`: 조회수
- `vote_score`: 추천 점수

### Comment
- `id`: 댓글 ID
- `content`: 내용
- `is_anonymous`: 익명 여부
- `parent_id`: 부모 댓글 ID (대댓글인 경우)

### Timetable
- `subject_name`: 과목명
- `teacher_name`: 선생님 이름
- `classroom`: 교실
- `day_of_week`: 요일 (0=월요일)
- `period`: 교시 (1-7)

### Assignment
- `title`: 제목
- `subject`: 과목
- `description`: 설명
- `due_date`: 마감일
- `grade`: 대상 학년
- `is_shared`: 공유 여부