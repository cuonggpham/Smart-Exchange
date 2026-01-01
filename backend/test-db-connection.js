const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
    console.log('🔄 Testing MySQL database connection...\n');

    try {
        // Test basic connection
        await prisma.$connect();
        console.log('✅ Successfully connected to MySQL database!\n');

        // Test query
        const result = await prisma.$queryRaw`SELECT VERSION() as version`;
        console.log('📊 MySQL Version:', result[0].version);

        // Get database name
        const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as db_name`;
        console.log('🗄️  Database Name:', dbInfo[0].db_name || 'Not selected');

        console.log('\n✅ Database connection test PASSED!');

    } catch (error) {
        console.error('\n❌ Database connection FAILED!');
        console.error('Error:', error.message);

        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 MySQL server is not running or not accessible.');
            console.error('   Please make sure MySQL is installed and running.');
        } else if (error.message.includes('Access denied')) {
            console.error('\n💡 Authentication failed.');
            console.error('   Please check your DATABASE_URL credentials in .env file.');
        } else if (error.message.includes('Unknown database')) {
            console.error('\n💡 Database does not exist.');
            console.error('   Please create the database first:');
            console.error('   mysql -u root -p -e "CREATE DATABASE smart_exchange;"');
        }

        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();
