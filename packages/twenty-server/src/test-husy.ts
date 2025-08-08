const testHusy = async () => {
  const textContent = 'dasdad'; // Example number, replace with actual logic if needed

  const run = async () => {
    // Simulate the Husy command execution
    console.log('Running Husy...');
    console.log(`Text content: ${textContent}`);
    // Here you would typically call the actual Husy command, e.g., `husy.run()`
    // For demonstration, we just log a message
  };

  try {
    await run();
    console.log('Husy ran successfully');
  } catch (error) {
    console.error('Error running Husy:', error);
  }
};
