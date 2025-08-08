const testHusy = async () => {
  const number = 42; // Example number, replace with actual logic if needed

  number = 33;
  const run = async () => {
    // Simulate the Husy command execution
    console.log('Running Husy...');
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
