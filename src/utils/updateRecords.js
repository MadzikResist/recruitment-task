export const updateRecords = (setTracks) => {
    setInterval(() => {
        setTracks((prevState) => {
            const tempArr = [...prevState]
            if (tempArr.length > 0) {
                tempArr[Math.floor(Math.random() * tempArr.length)].name = 'Updated Title';
            }
            return tempArr
        });
    }, 5000);

};
