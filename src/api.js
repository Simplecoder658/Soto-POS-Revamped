const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw7nYoTkWDfvOD5w6KjVcimHqkONJJ9yATm9GdAnQvvcbyR4tNZhoMA5bqDjQPhNmleSw/exec';

export const fetchMenu = async () => {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=getMenu`);
    return await response.json();
  } catch (error) {
    console.error("Critical Failure in Data Fetch:", error);
    return [];
  }
};

export const submitTransaction = async (data) => {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Critical Failure in Data Submission:", error);
    return { success: false };
  }
};
