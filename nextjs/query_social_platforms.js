console.log('Starting social platforms query...');

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = 'https://mqkkrtuxsogftkongsqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa2tydHV4c29nZnRrb25nc3F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3MDY3MDgsImV4cCI6MjA2NDI4MjcwOH0.Bge3vkuS6hkbfHMRbPn89rGsYhuwW00ma3u9rJ-tKpE';

console.log('Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client created successfully');

async function querySocialPlatforms() {
    console.log('Querying social_platforms table...');
    
    // Query social_platforms table
    const { data: socialPlatforms, error: socialError } = await supabase
        .from('social_platforms')
        .select('*')
        .order('name');
    
    if (socialError) {
        console.error('Error querying social_platforms:', socialError);
        
        // Try alternative table name 'social'
        console.log('Trying alternative table name "social"...');
        const { data: socialData, error: socialError2 } = await supabase
            .from('social')
            .select('*')
            .order('name');
        
        if (socialError2) {
            console.error('Error querying social table:', socialError2);
            
            // Try to list all tables to see what's available
            console.log('Trying to inspect available tables...');
            const { data: tables, error: tablesError } = await supabase
                .rpc('get_table_names') // This may not work, but let's try
                .catch(() => {
                    console.log('Could not list tables via RPC');
                    return { data: null, error: 'RPC not available' };
                });
            
            if (tablesError) {
                console.log('RPC get_table_names not available');
            } else {
                console.log('Available tables:', tables);
            }
        } else {
            console.log('Social platforms from "social" table:');
            console.log(socialData);
            return socialData;
        }
    } else {
        console.log('Social platforms from "social_platforms" table:');
        console.log(socialPlatforms);
        return socialPlatforms;
    }
    
    return null;
}

// Also query for actual social media usage in user profiles
async function queryUserSocialUsage() {
    console.log('\nQuerying user social media usage...');
    
    const { data: users, error } = await supabase
        .from('musician_profiles')
        .select('social')
        .limit(100);
    
    if (error) {
        console.error('Error querying musician_profiles:', error);
        
        // Try users table instead
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('social')
            .limit(100);
        
        if (usersError) {
            console.error('Error querying users table:', usersError);
            return null;
        } else {
            console.log('Found user social data from users table');
            return usersData;
        }
    }
    
    console.log('Found user social data from musician_profiles table');
    return users;
}

async function analyzeSocialPlatforms() {
    const platforms = await querySocialPlatforms();
    const userSocial = await queryUserSocialUsage();
    
    if (userSocial) {
        console.log('\nAnalyzing user social media platforms...');
        const platformNames = new Set();
        
        userSocial.forEach(user => {
            if (user.social) {
                try {
                    let socialData = user.social;
                    if (typeof socialData === 'string') {
                        socialData = JSON.parse(socialData);
                    }
                    
                    if (Array.isArray(socialData)) {
                        socialData.forEach(item => {
                            if (item.platform) {
                                platformNames.add(item.platform);
                            }
                            if (item.name) {
                                platformNames.add(item.name);
                            }
                        });
                    }
                } catch (e) {
                    // Skip invalid JSON
                }
            }
        });
        
        console.log('Unique social platforms found in user data:');
        console.log(Array.from(platformNames).sort());
    }
    
    // Show current getSocialIcon support
    console.log('\nCurrent getSocialIcon function supports:');
    const currentSupport = ['youtube', 'instagram', 'facebook', 'twitter', 'x', 'linkedin', 'spotify'];
    console.log(currentSupport);
    
    return { platforms, userSocial, currentSupport };
}

analyzeSocialPlatforms()
    .then(result => {
        console.log('\n=== ANALYSIS COMPLETE ===');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error in analysis:', err);
        process.exit(1);
    });
