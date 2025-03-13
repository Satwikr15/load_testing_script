import org.example.Calculator;
import org.example.CalculatorService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;



import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

public class TestCalculator {
    Calculator c=null;
    CalculatorService service= Mockito.mock(CalculatorService.class);
//            new CalculatorService() {
//        @Override
//        public int add(int i, int j) {
//            return 0;
//        }
//    };

    @BeforeEach
    public void setUp(){
        c=new Calculator(service);
    }

    @Test
    public void testPerform(){
        when(service.add(2,3)).thenReturn(5);
        assertEquals(100,c.perform(2,3));
        System.out.println("yes done !");
    }
}
