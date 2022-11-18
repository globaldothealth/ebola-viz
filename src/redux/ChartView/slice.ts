import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChartData } from 'models/ChartData';

export enum ChartType {
    Bar,
    Cumulative,
}

interface ChartViewState {
    chartData: ChartData;
    chartType: ChartType;
}

const initialState: ChartViewState = {
    chartData: [],
    chartType: ChartType.Bar,
};

const chartSlice = createSlice({
    name: 'chartView',
    initialState,
    reducers: {
        setChartData: (state, action: PayloadAction<ChartData>) => {
            state.chartData = action.payload;
        },
        setChartType: (state, action: PayloadAction<ChartType>) => {
            state.chartType = action.payload;
        },
    },
});

export const { setChartData, setChartType } = chartSlice.actions;

export default chartSlice.reducer;
