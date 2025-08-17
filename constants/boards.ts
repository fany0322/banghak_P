export type Board = {
  id: string;
  name: string;
  category: '게시판' | '정보' | '홍보' | '기타';
};

export const BOARDS: Board[] = [
  { id: 'free',   name: '자유 게시판',   category: '게시판' },
  { id: 'qna',    name: '질문 게시판',   category: '게시판' },
  { id: 'scrap',  name: '스크랩 한 글',   category: '게시판' },
  { id: 'hot',    name: '핫 게시판',     category: '게시판' },
  { id: 'notice', name: '공지 사항',     category: '정보' },
  { id: 'tip',    name: '팁/정보',       category: '정보' },
  { id: 'promo',  name: '홍보 게시판',   category: '홍보' },
  { id: 'etc',    name: '기타',          category: '기타' },
];

export type Post = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  comments: number;
  likes: number;
  thumb?: string;
};

export const MOCK_POSTS: Record<string, Post[]> = {
  free: [
    { id: 'p1', title: '글제목', body: 'Lorem ipsum dolor sit amet, consectetur…',
      createdAt: new Date().toISOString(), comments: 0, likes: 9 },
    { id: 'p2', title: '글제목제목', body: 'Adipisicing elit, sed do eiusmod…',
      createdAt: new Date(Date.now()-60_000).toISOString(), comments: 8, likes: 0,
      thumb: 'https://picsum.photos/seed/1/120/80' },
  ],
  qna: [], scrap: [], hot: [], notice: [], tip: [], promo: [], etc: [],
};
