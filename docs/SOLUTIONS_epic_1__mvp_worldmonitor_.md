import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

# Define your database URL here (e.g., postgresql+asyncpg://user:pass@host/db)
DATABASE_URL = "sqlite+aiosqlite:///./test.db" 

async def setup_database():
    """Initializes the async engine and session."""
    print(f"Creating asynchronous engine for {DATABASE_URL}...")
    # Use create_async_engine to establish the connection pool
    engine = create_async_engine(DATABASE_URL, echo=True)

    # Example usage: Create a simple table if it doesn't exist (Requires async context)
    print("Creating sample table.")
    await engine.run_sync(lambda s: s.execute(text("""
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL
        );
    """)))

    # Example usage: Connect and perform an async read/write operation
    async with AsyncSession(engine) as session:
        print("\n--- Performing sample database operations ---")
        
        # Insert data (if necessary for testing)
        await session.execute(text("INSERT INTO records (name) VALUES (:name)")).values({"name": "TestEntry"})

        # Query the data
        result = await session.execute(text("SELECT name FROM records WHERE name='TestEntry'"))
        records = result.fetchall()
        print(f"Query Results: {records}")
        
        await session.commit()
    
    print("\nDatabase operations completed successfully.")


if __name__ == "__main__":
    # This structure is necessary to run the async code block
    try:
        asyncio.run(setup_database())
    except ImportError as e:
        print("-" * 60)
        print("ERROR FIX REQUIRED:")
        print(f"The error '{e}' indicates that 'sqlalchemy' or its necessary drivers (like 'aiosqlite', 'asyncpg') are not installed.")
        print("Please run the following command in your terminal to install dependencies:")
        print("pip install sqlalchemy aiosqlite")
        print("-" * 60)
