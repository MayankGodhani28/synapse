async function testExtensionCall() {
  const payload = {
    user_id: 'extension(rudra.vadhadiya@gmail.com)',
    content: 'Deep learning neural networks can learn representations of data with multiple levels of abstraction.',
    source_url: 'https://nature.com/articles/nature14539',
    source_type: 'webpage',
  };

  console.log('Sending browser extension payload:', payload);

  const res = await fetch('http://localhost:5000/memory/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Server response:', data);

  // Now search for it
  const searchRes = await fetch('http://localhost:5000/memory/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'extension(rudra.vadhadiya@gmail.com)',
      query: 'What is artificial intelligence representation learning?',
    }),
  });

  const searchData = await searchRes.json();
  console.log('Search response:', searchData);

  // Now ask a chat question
  const chatRes = await fetch('http://localhost:5000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'extension(rudra.vadhadiya@gmail.com)',
      question: 'What can neural networks learn?',
    }),
  });

  const chatData = await chatRes.json();
  console.log('Chat response:', chatData);
}

testExtensionCall().catch(console.error);
