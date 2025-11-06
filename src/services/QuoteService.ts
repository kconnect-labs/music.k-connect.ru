interface Quote {
  text: string;
  author: string;
  title?: string;
}

/**
 * Получает случайную строку из текстов песен из нашего API
 */
export const getRandomQuote = async (): Promise<Quote | null> => {
  try {
    const response = await fetch('/api/music/random-lyric-line', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include', // Важно для отправки cookies
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.text && data.artist) {
        // Формируем автора: "Исполнитель Название трека" или просто "Исполнитель"
        const author = data.title 
          ? `${data.artist} ${data.title}`
          : data.artist;
        
        return {
          text: data.text,
          author: author,
          title: data.title,
        };
      }
    }
  } catch (error) {
    console.error('Error fetching lyric line:', error);
  }

  // Fallback цитата
  return {
    text: 'Музыка — это язык, который объединяет сердца.',
    author: 'К-Коннект',
  };
};

