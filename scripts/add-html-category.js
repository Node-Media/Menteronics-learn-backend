const tutorialData = {
  title: "Introduction to HTML",
  slug: "introduction-to-html",
  order: 1,
  summary: "Learn the fundamentals of HTML, the standard markup language for creating web pages. Understand what HTML is, why it exists, and how it structures web content.",
  isPublished: true,
  content: [
    {
      "type": "heading",
      "level": 2,
      "content": "What is HTML?"
    },
    {
      "type": "paragraph",
      "content": "HTML stands for HyperText Markup Language."
    },
    {
      "type": "paragraph",
      "content": "It is the standard language used to create web pages. Every website you visit is built using HTML in some form."
    },
    {
      "type": "paragraph",
      "content": "HTML is not a programming language. It does not perform calculations or make decisions. Its purpose is simple:"
    },
    {
      "type": "paragraph",
      "content": "HTML defines the structure and meaning of content on the web."
    },
    {
      "type": "paragraph",
      "content": "When you see:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "A heading",
        "A paragraph",
        "A button",
        "A list"
      ]
    },
    {
      "type": "paragraph",
      "content": "HTML is what tells the browser what each of those things is."
    },
    {
      "type": "heading",
      "level": 2,
      "content": "Why HTML Exists"
    },
    {
      "type": "paragraph",
      "content": "Computers do not understand visual layout the way humans do. If you write plain text like this:"
    },
    {
      "type": "code",
      "language": "text",
      "content": "Welcome to my website\nThis is about web development\nContact me"
    },
    {
      "type": "paragraph",
      "content": "The browser cannot automatically determine:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "Which line is a title",
        "Which line is a section",
        "Which line is important"
      ]
    },
    {
      "type": "paragraph",
      "content": "HTML solves this by adding structure."
    },
    {
      "type": "paragraph",
      "content": "For example:"
    },
    {
      "type": "code",
      "language": "html",
      "content": "<h1>Welcome to my website</h1>\n<p>This is about web development.</p>"
    },
    {
      "type": "paragraph",
      "content": "Now the browser understands:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "This is a main heading",
        "This is a paragraph"
      ]
    },
    {
      "type": "paragraph",
      "content": "HTML gives meaning to content."
    },
    {
      "type": "heading",
      "level": 2,
      "content": "What Does \"Markup\" Mean?"
    },
    {
      "type": "paragraph",
      "content": "The word markup means adding labels to content."
    },
    {
      "type": "paragraph",
      "content": "Imagine you are editing a document and you highlight:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "Titles",
        "Subtitles",
        "Notes"
      ]
    },
    {
      "type": "paragraph",
      "content": "You are marking up the document to show its structure."
    },
    {
      "type": "paragraph",
      "content": "HTML does the same thing for web pages."
    },
    {
      "type": "paragraph",
      "content": "Example:"
    },
    {
      "type": "code",
      "language": "html",
      "content": "<h1>Introduction to Web Development</h1>\n<p>Web development involves building websites and web applications.</p>"
    },
    {
      "type": "paragraph",
      "content": "Here:"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        "<h1> marks content as a main heading",
        "<p> marks content as a paragraph"
      ]
    },
    {
      "type": "paragraph",
      "content": "The browser reads these labels and renders them appropriately."
    }
  ]
};

async function createHTMLCategory() {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';
  
  // Admin credentials
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@menteronics.tech';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Qwertyui@123456';
  
  console.log('🚀 Starting HTML category and tutorial creation...\n');
  console.log(`Using backend: ${BACKEND_URL}`);
  console.log(`Admin email: ${ADMIN_EMAIL}\n`);

  try {
    // Step 1: Login to get auth token
    console.log('🔐 Logging in...');
    const loginRes = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!loginRes.ok) {
      const errorText = await loginRes.text();
      throw new Error(`Login failed: ${errorText}`);
    }

    const { token } = await loginRes.json();
    console.log('✅ Logged in successfully\n');

    // Step 2: Create HTML category
    console.log('📁 Creating HTML category...');
    const categoryRes = await fetch(`${BACKEND_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({
        name: 'HTML',
        slug: 'html',
        description: 'Learn HTML - the foundation of all web pages. Master the structure and semantics of web content.'
      })
    });

    if (!categoryRes.ok) {
      const error = await categoryRes.json();
      throw new Error(`Failed to create HTML category: ${JSON.stringify(error)}`);
    }

    const htmlCategory = await categoryRes.json();
    console.log(`✅ Created HTML category (ID: ${htmlCategory.doc.id})\n`);

    // Step 3: Create the tutorial
    console.log(`📝 Creating tutorial: "${tutorialData.title}"...`);
    
    const tutorialRes = await fetch(`${BACKEND_URL}/api/tutorials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `JWT ${token}`
      },
      body: JSON.stringify({
        ...tutorialData,
        category: htmlCategory.doc.id
      })
    });

    if (!tutorialRes.ok) {
      const error = await tutorialRes.json();
      throw new Error(`Failed to create tutorial: ${JSON.stringify(error)}`);
    }

    const created = await tutorialRes.json();
    console.log(`✅ Created "${tutorialData.title}" (Order: ${tutorialData.order})\n`);

    console.log('🎉 HTML category and tutorial created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Category: HTML`);
    console.log(`   - Tutorial: ${tutorialData.title}`);
    console.log(`   - Published: Yes`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createHTMLCategory();
